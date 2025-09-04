import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User,
  onAuthStateChanged,
  applyActionCode,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./firebase";

const getAuthErrorMessage = (error: any): string => {
  console.error("Auth error details:", {
    code: error.code,
    message: error.message,
    customData: error.customData,
    origin: window.location.origin,
  });

  switch (error.code) {
    case "auth/unauthorized-domain":
      return `Authentication domain not authorized. Please ensure ${window.location.origin} is added to the Firebase Console's authorized domains list.`;
    case "auth/popup-closed-by-user":
      return "The sign-in popup was closed before completing the sign-in.";
    case "auth/popup-blocked":
      return "Pop-up was blocked by your browser. Please enable pop-ups for this site.";
    case "auth/cancelled-popup-request":
      return "Multiple pop-up requests were detected. Please try again.";
    case "auth/email-already-in-use":
      return "This email is already in use.";
    case "auth/invalid-action-code":
      return "The verification link has expired or already been used.";
    case "auth/user-not-found":
      return "No user found with this email address.";
    case "auth/requires-recent-login":
      return "Please log in again to complete this action.";
    default:
      return error.message || "An unexpected error occurred.";
  }
};

export const signInWithGoogle = async () => {
  try {
    console.log("Starting Google sign-in process...");
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Google sign-in successful", { uid: result.user.uid });

    const user = result.user;
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      console.log("Creating new user document in Firestore");
      const userData = {
        uid: user.uid,
        email: user.email,
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
        emailVerified: "Yes",
        createdAt: new Date().toISOString(),
        signInMethod: "google",
      };

      await setDoc(userDocRef, userData);
      console.log("User document created successfully");

      // Send welcome email for new Google OAuth users
      try {
        const welcomeResponse = await fetch("/api/send-welcome-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userName: user.displayName || user.email?.split("@")[0] || "New User",
            userEmail: user.email,
          }),
        });

        if (welcomeResponse.ok) {
          console.log("Welcome email sent successfully for Google OAuth user");
        } else {
          console.error("Failed to send welcome email for Google OAuth user");
        }
      } catch (welcomeEmailError) {
        console.error("Error sending welcome email for Google OAuth user:", welcomeEmailError);
      }
    }

    return user;
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    throw new Error(getAuthErrorMessage(error));
  }
};

export const signUp = async (values: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  country: string;
  countryCode: string;
  phoneNumber: string;
}) => {
  try {
    console.log("Starting user registration process...");

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      values.email,
      values.password,
    );

    console.log("User created in Firebase Auth:", userCredential.user.uid);

    const userData = {
      uid: userCredential.user.uid,
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      country: values.country,
      countryCode: values.countryCode,
      phoneNumber: values.phoneNumber,
      emailVerified: "No",
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "users", userCredential.user.uid), userData);
    console.log("User document created in Firestore");

    try {
      // Send verification email
      const verificationResponse = await fetch("/api/send-verification-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: `${values.firstName} ${values.lastName}`,
          userEmail: values.email,
          verificationLink: `${window.location.origin}/verify-email?oobCode=${await userCredential.user.getIdToken()}`,
        }),
      });

      if (!verificationResponse.ok) {
        throw new Error("Failed to send verification email");
      }

      console.log("Custom verification email sent successfully");

      // Send welcome email immediately
      try {
        const welcomeResponse = await fetch("/api/send-welcome-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userName: `${values.firstName} ${values.lastName}`,
            userEmail: values.email,
          }),
        });

        if (welcomeResponse.ok) {
          console.log("Welcome email sent successfully");
        } else {
          console.error("Failed to send welcome email");
        }
      } catch (welcomeEmailError) {
        console.error("Error sending welcome email:", welcomeEmailError);
      }
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
    }

    return userCredential.user;
  } catch (error: any) {
    console.error("Registration error:", error);
    throw new Error(getAuthErrorMessage(error));
  }
};

export const signIn = async (
  email: string,
  password: string,
  rememberMe: boolean = false,
) => {
  try {
    await setPersistence(
      auth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence,
    );

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    const userDocRef = doc(db, "users", userCredential.user.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data();

    if (
      !userCredential.user.emailVerified ||
      userData?.emailVerified === "No"
    ) {
      await firebaseSignOut(auth);
      throw new Error("Please verify your email before logging in.");
    }

    return userCredential.user;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error));
  }
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    localStorage.removeItem("auth_persistence");
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error));
  }
};

export const handleEmailVerificationSuccess = async (oobCode: string) => {
  try {
    if (!oobCode) {
      throw new Error("No verification code found");
    }

    const response = await fetch(`/api/verify-email?oobCode=${oobCode}`);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return true;
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error));
  }
};

export const sendPasswordResetEmail = async (email: string) => {
  try {
    await firebaseSendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(getAuthErrorMessage(error));
  }
};