/**
 * File compression utilities for attachments
 * Handles image and PDF compression to meet size requirements
 */

/**
 * Compresses an image file to meet size requirements
 * @param {File} file - The image file to compress
 * @param {number} maxSizeBytes - Maximum allowed size in bytes (default 1MB)
 * @param {number} quality - Initial compression quality (0-1)
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = async (file, maxSizeBytes = 1024 * 1024, quality = 0.9) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions if image is too large
                const MAX_DIMENSION = 2048;
                if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                    if (width > height) {
                        height = (height / width) * MAX_DIMENSION;
                        width = MAX_DIMENSION;
                    } else {
                        width = (width / height) * MAX_DIMENSION;
                        height = MAX_DIMENSION;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Try different quality levels to meet size requirement
                const tryCompress = (currentQuality) => {
                    canvas.toBlob(
                        (blob) => {
                            if (!blob) {
                                reject(new Error('Failed to compress image'));
                                return;
                            }

                            console.log(`Compressed image: ${(blob.size / 1024).toFixed(2)}KB at quality ${currentQuality}`);

                            // If still too large and quality can be reduced further
                            if (blob.size > maxSizeBytes && currentQuality > 0.1) {
                                tryCompress(currentQuality - 0.1);
                            } else {
                                // Create new file from blob
                                const compressedFile = new File(
                                    [blob],
                                    file.name,
                                    {
                                        type: file.type,
                                        lastModified: Date.now()
                                    }
                                );
                                resolve(compressedFile);
                            }
                        },
                        file.type,
                        currentQuality
                    );
                };

                tryCompress(quality);
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };

            img.src = e.target.result;
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsDataURL(file);
    });
};

/**
 * Compresses a PDF file (basic approach - reduces quality)
 * Note: Full PDF compression requires external libraries
 * This is a placeholder that returns the original file
 * @param {File} file - The PDF file
 * @param {number} maxSizeBytes - Maximum allowed size in bytes
 * @returns {Promise<File>} - Original or compressed PDF
 */
export const compressPDF = async (file, maxSizeBytes = 1024 * 1024) => {
    // PDF compression is complex and typically requires server-side processing
    // or libraries like pdf-lib. For now, we'll just warn the user.
    console.warn('PDF compression not implemented. File size:', (file.size / 1024).toFixed(2), 'KB');

    if (file.size > maxSizeBytes) {
        throw new Error(`PDF file is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum size is ${(maxSizeBytes / 1024 / 1024).toFixed(2)}MB. Please compress the PDF manually.`);
    }

    return file;
};

/**
 * Validates and compresses a file if needed
 * @param {File} file - The file to validate and compress
 * @param {number} maxSizeBytes - Maximum allowed size in bytes (default 1MB)
 * @returns {Promise<{file: File, wasCompressed: boolean, originalSize: number, newSize: number}>}
 */
export const validateAndCompressFile = async (file, maxSizeBytes = 1024 * 1024) => {
    const originalSize = file.size;

    // Check file type
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    if (!isImage && !isPDF) {
        throw new Error('Only image and PDF files are allowed');
    }

    // If file is within size limit, return as is
    if (file.size <= maxSizeBytes) {
        return {
            file,
            wasCompressed: false,
            originalSize,
            newSize: file.size
        };
    }

    // Compress if needed
    let compressedFile;
    if (isImage) {
        compressedFile = await compressImage(file, maxSizeBytes);
    } else if (isPDF) {
        compressedFile = await compressPDF(file, maxSizeBytes);
    }

    return {
        file: compressedFile,
        wasCompressed: true,
        originalSize,
        newSize: compressedFile.size
    };
};

/**
 * Formats file size for display
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size string
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Validates file type
 * @param {File} file - The file to validate
 * @returns {boolean} - True if file type is allowed
 */
export const isAllowedFileType = (file) => {
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';
    return isImage || isPDF;
};

/**
 * Gets file type category
 * @param {File} file - The file
 * @returns {string} - 'image', 'pdf', or 'other'
 */
export const getFileCategory = (file) => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'pdf';
    return 'other';
};
