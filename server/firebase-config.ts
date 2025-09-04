import admin from "firebase-admin";
import { getStorage } from "firebase-admin/storage";

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Initialize Firebase Admin
const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
});

// Get storage instance
const storage = getStorage(app);
const bucket = storage.bucket();

// Configure CORS for the bucket
async function configureCORS() {
  try {
    await bucket.setCorsConfiguration([
      {
        maxAgeSeconds: 3600,
        method: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        origin: [
          process.env.NODE_ENV === "production" 
            ? [
                "https://commertize.com",
                "https://www.commertize.com"
              ]
            : [
                "http://localhost:5000",
                "https://*.repl.co"
              ]
        ].flat(),
        responseHeader: [
          "Content-Type",
          "Access-Control-Allow-Origin",
          "Authorization",
          "Content-Length",
          "User-Agent",
          "X-Upload-Content-Type",
          "X-Upload-Content-Length",
          "x-goog-*",
          "x-firebase-*",
          "accept",
          "accept-encoding",
          "accept-language",
          "access-control-allow-headers",
          "access-control-allow-origin",
          "access-control-expose-headers",
          "access-control-max-age",
          "access-control-request-headers",
          "access-control-request-method"
        ],
      },
    ]);
    console.log("Successfully configured CORS for Firebase Storage");
  } catch (error) {
    console.error("Error configuring CORS:", error);
    // Don't exit the process on CORS configuration failure
    console.error("Firebase Storage will continue without CORS configuration");
  }
}

// Initialize immediately
configureCORS().then(() => {
  console.log("Firebase Storage initialization completed");
}).catch(error => {
  console.error("Failed to initialize Firebase Storage:", error);
  // Don't exit the process, just log the error
  console.error("Application will continue without Firebase Storage configuration");
});

export { storage, bucket, configureCORS };