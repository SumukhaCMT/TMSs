import imageCompression from 'browser-image-compression';

/**
 * Converts an uploaded File object to a WebP Base64 string using a Web Worker.
 * This prevents UI freeze/lag during compression.
 * * @param file - The file object from the input.
 * @param quality - (Optional) Compression quality between 0 and 1. Default is 0.8.
 * @returns Promise<string> - The WebP Base64 string.
 */
export const convertImageToWebP = async (file: File, quality = 0.8): Promise<string> => {
  // 1. Options for compression
  const options = {
    maxSizeMB: 1,             // Reduce file size to ~1MB
    maxWidthOrHeight: 1920,   // Resize if larger than Full HD
    useWebWorker: true,       // CRITICAL: Runs in background to prevent lag
    fileType: "image/webp",   // Force conversion to WebP
    initialQuality: quality,  // Quality setting
  };

  try {
    // 2. Compress the file (This happens in a background thread)
    const compressedBlob = await imageCompression(file, options);

    // 3. Convert the Blob back to Base64 for your API
    return await blobToBase64(compressedBlob);
  } catch (error) {
    console.error("Compression Error:", error);
    throw error;
  }
};

// Helper function to convert Blob -> Base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      resolve(base64data);
    };
    reader.onerror = reject;
  });
};