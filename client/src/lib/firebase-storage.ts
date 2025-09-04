import { getStorage, ref, uploadBytesResumable, getDownloadURL, StorageError } from "firebase/storage";
import { db } from "./firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";

const storage = getStorage();

export interface PropertyImage {
  url: string;
  fileName: string;
  uploadedAt: string;
  contentType: string;
  size: number;
}

export interface PropertyDocument {
  title: string;
  url: string;
  fileName: string;
  uploadedAt: string;
  contentType: string;
  size: number;
}

function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  const fileExt = originalName.split('.').pop();
  return `${timestamp}-${randomStr}.${fileExt}`;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

function getFirebaseErrorMessage(error: StorageError): string {
  switch (error.code) {
    case 'storage/unauthorized':
      return 'Access denied. Please check storage permissions.';
    case 'storage/canceled':
      return 'Upload was canceled.';
    case 'storage/invalid-argument':
      return 'Invalid file type or size.';
    case 'storage/unknown':
      return 'An unknown error occurred. Please try again.';
    case 'storage/quota-exceeded':
      return 'Storage quota exceeded.';
    case 'storage/retry-limit-exceeded':
      return 'Upload failed due to network issues. Please check your connection and try again.';
    case 'storage/invalid-checksum':
      return 'File upload failed validation. Please try again.';
    case 'storage/server-file-wrong-size':
      return 'File upload was incomplete. Please try again.';
    default:
      return `Upload error: ${error.message}`;
  }
}

async function uploadSingleFile(file: File, propertyId: string, type: 'image' | 'document' | 'brochure', retryCount = 0): Promise<PropertyImage | PropertyDocument> {
  const hashedFileName = generateUniqueFileName(file.name);
  const fileName = `properties/${propertyId}/${type}s/${hashedFileName}`;
  const storageRef = ref(storage, fileName);

  console.log('Starting upload attempt', retryCount + 1, 'of', MAX_RETRIES, {
    fileName,
    size: file.size,
    type: file.type,
    propertyId,
    timestamp: new Date().toISOString()
  });

  const metadata = {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
      propertyId,
      uploadTimestamp: new Date().toISOString(),
      fileType: type
    }
  };

  try {
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    // Create a promise to handle the upload
    const uploadResult = await new Promise<PropertyImage | PropertyDocument>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress: ${progress.toFixed(2)}%`);
        },
        async (error: StorageError) => {
          const errorMessage = getFirebaseErrorMessage(error);
          console.error('Upload error:', {
            code: error.code,
            message: error.message,
            serverResponse: error.serverResponse
          });

          if (retryCount < MAX_RETRIES - 1) {
            const retryDelay = RETRY_DELAY * Math.pow(2, retryCount);
            console.log(`Retrying upload in ${retryDelay}ms...`);
            setTimeout(async () => {
              try {
                const result = await uploadSingleFile(file, propertyId, type, retryCount + 1);
                resolve(result);
              } catch (retryError) {
                reject(retryError);
              }
            }, retryDelay);
          } else {
            reject(new Error(errorMessage));
          }
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              url: downloadUrl,
              fileName: hashedFileName,
              uploadedAt: new Date().toISOString(),
              contentType: file.type,
              size: file.size,
              ...(type !== 'image' && { title: file.name })
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });

    return uploadResult;
  } catch (error) {
    const errorMessage = error instanceof StorageError 
      ? getFirebaseErrorMessage(error)
      : error instanceof Error 
        ? error.message 
        : 'Unknown upload error';

    console.error('Upload failed:', {
      fileName,
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : 'Unknown error'
    });
    throw new Error(errorMessage);
  }
}

export async function createPropertyWithImages(
  propertyData: any,
  files: { 
    images?: FileList | File[], 
    documents?: FileList | File[],
    brochure?: FileList | File[]
  }
): Promise<string> {
  try {
    console.log("Starting property creation with images and documents...");
    console.log("Property data:", {
      ...propertyData,
      active: false,
      featured: false,
      createdAt: new Date().toISOString()
    });
    console.log("Number of images:", files.images?.length || 0);
    console.log("Number of documents:", files.documents?.length || 0);
    console.log("Number of brochures:", files.brochure?.length || 0);

    // Create the property document with active: false by default
    const propertyDoc = await addDoc(collection(db, "properties"), {
      ...propertyData,
      active: false,
      featured: false,
      imageUrls: [],
      images: [],
      documents: [],
      brochureUrl: '',
      createdAt: new Date().toISOString()
    });

    console.log("Created property document with ID:", propertyDoc.id);

    const uploadedImages: PropertyImage[] = [];
    const uploadedDocuments: PropertyDocument[] = [];
    let brochureUrl = '';
    const errors: string[] = [];

    // Upload images if any
    if (files.images && files.images.length > 0) {
      const imagesArray = Array.from(files.images);
      for (const file of imagesArray) {
        try {
          console.log(`Processing image: ${file.name} (${file.size} bytes, ${file.type})`);
          const uploadedImage = await uploadSingleFile(file, propertyDoc.id, 'image') as PropertyImage;
          uploadedImages.push(uploadedImage);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error uploading image';
          errors.push(`Failed to upload ${file.name}: ${errorMessage}`);
        }
      }
    }

    // Upload documents if any
    if (files.documents && files.documents.length > 0) {
      const documentsArray = Array.from(files.documents);
      for (const file of documentsArray) {
        try {
          console.log(`Processing document: ${file.name} (${file.size} bytes, ${file.type})`);
          const uploadedDocument = await uploadSingleFile(file, propertyDoc.id, 'document') as PropertyDocument;
          uploadedDocuments.push(uploadedDocument);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error uploading document';
          errors.push(`Failed to upload ${file.name}: ${errorMessage}`);
        }
      }
    }

    // Upload brochure if any
    if (files.brochure && files.brochure.length > 0) {
      try {
        const brochureFile = files.brochure[0]; // Take the first file as brochure
        console.log(`Processing brochure: ${brochureFile.name} (${brochureFile.size} bytes, ${brochureFile.type})`);
        const uploadedBrochure = await uploadSingleFile(brochureFile, propertyDoc.id, 'brochure') as PropertyDocument;
        brochureUrl = uploadedBrochure.url;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error uploading brochure';
        errors.push(`Failed to upload brochure: ${errorMessage}`);
      }
    }

    // Update property with uploaded files information
    await updateDoc(doc(db, "properties", propertyDoc.id), {
      imageUrls: uploadedImages.map(img => img.url),
      images: uploadedImages,
      documents: uploadedDocuments,
      brochureUrl: brochureUrl
    });

    if (errors.length > 0) {
      throw new Error(`Some files failed to upload: ${errors.join('; ')}`);
    }

    return propertyDoc.id;
  } catch (error) {
    console.error("Error in createPropertyWithImages:", error);
    throw error;
  }
}