/**
 * Image URL utility functions for handling product images
 * Supports Cloudinary CDN with optimizations and local fallback
 */

/**
 * Get the backend base URL from environment or fallback to localhost
 */
export function getBackendUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001';
}

/**
 * Cloudinary configuration
 */
const CLOUDINARY_CLOUD_NAME = 'du7kvit2g';
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Check if URL is a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
}

/**
 * Generate optimized Cloudinary URL with transformations
 * @param url - Original Cloudinary URL
 * @param options - Transformation options
 * @returns Optimized URL with transformations
 */
export function getOptimizedCloudinaryUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
    crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'limit';
  } = {}
): string {
  if (!isCloudinaryUrl(url)) return url;

  const { width, height, quality = 'auto', format = 'auto', crop = 'fill' } = options;

  // Extract public ID from Cloudinary URL
  // Format: https://res.cloudinary.com/cloud_name/image/upload/v123/folder/file.ext
  const urlParts = url.split('/upload/');
  if (urlParts.length !== 2) return url;

  const [baseUrl, pathWithVersion] = urlParts;

  // Build transformation string
  const transformations: string[] = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);

  const transformString = transformations.join(',');

  return `${baseUrl}/upload/${transformString}/${pathWithVersion}`;
}

/**
 * Convert a backend image path to a full URL
 * @param imagePath - The image path from backend (e.g., "/uploads/image.jpg" or Cloudinary URL)
 * @param fallback - Fallback image path if no image is provided
 * @returns Full URL to the image
 */
export function getImageUrl(
  imagePath: string | undefined | null,
  fallback: string = '/assets/tulumba.png'
): string {
  // Return fallback if no image path
  if (!imagePath) return fallback;

  // If already a Cloudinary URL, return optimized version
  if (isCloudinaryUrl(imagePath)) {
    return getOptimizedCloudinaryUrl(imagePath, {
      quality: 'auto',
      format: 'auto'
    });
  }

  // If already a full URL (http/https), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a local asset path (starts with /assets), return as-is
  if (imagePath.startsWith('/assets')) {
    return imagePath;
  }

  // For local uploads (/uploads/...), construct full URL
  // This is now a fallback for development only
  const baseUrl = getBackendUrl();
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Get product image URL from product image array
 * @param images - Array of image paths from product
 * @param index - Index of image to get (default: 0)
 * @param fallback - Fallback image path
 * @returns Full URL to the product image
 */
export function getProductImageUrl(
  images: string[] | undefined | null,
  index: number = 0,
  fallback: string = '/assets/tulumba.png'
): string {
  const imagePath = images && images.length > index ? images[index] : undefined;
  return getImageUrl(imagePath, fallback);
}

/**
 * Get responsive image URLs for srcset
 * @param images - Array of image paths from product
 * @param index - Index of image to get
 * @param sizes - Array of widths for responsive images
 * @returns Object with srcset and sizes strings
 */
export function getResponsiveImageUrls(
  images: string[] | undefined | null,
  index: number = 0,
  sizes: number[] = [400, 800, 1200]
): { srcset: string; sizes: string } | null {
  const imagePath = images && images.length > index ? images[index] : undefined;

  if (!imagePath || !isCloudinaryUrl(imagePath)) return null;

  const srcset = sizes
    .map(width => {
      const url = getOptimizedCloudinaryUrl(imagePath, { width, quality: 'auto', format: 'auto' });
      return `${url} ${width}w`;
    })
    .join(', ');

  const sizesAttr = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';

  return { srcset, sizes: sizesAttr };
}
