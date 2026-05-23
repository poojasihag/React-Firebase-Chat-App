/**
 * Compresses an image file to a base64 data URL.
 * @param {File} file - The image file to process.
 * @param {Object} options - Optional settings.
 * @param {number} options.maxSize - Max width/height in pixels (default 200).
 * @param {number} options.quality - JPEG quality 0-1 (default 0.5).
 * @returns {Promise<string>} - The compressed base64 data URL.
 */
const upload = async (file, options = {}) => {
  const { maxSize = 200, quality = 0.5 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round(height * (maxSize / width));
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round(width * (maxSize / height));
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => {
        reject(new Error("Failed to process image."));
      };
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file."));
    };
  });
};

export default upload;
