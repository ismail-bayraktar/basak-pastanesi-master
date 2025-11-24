/**
 * Image URL utility functions for handling product images
 * Converts backend relative paths to full URLs
 */

/**
 * Get the backend base URL from environment or fallback to localhost
 * Note: In browser context, use NEXT_PUBLIC_BACKEND_URL or similar
 */
export function getBackendUrl(backendUrl?: string): string {
  return backendUrl || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4001';
}

/**
 * Convert a backend image path to a full URL
 * @param imagePath - The image path from backend (e.g., "/uploads/image.jpg")
 * @param fallback - Fallback image path if no image is provided
 * @param backendUrl - Optional backend URL override
 * @returns Full URL to the image
 */
export function getImageUrl(
  imagePath: string | undefined | null,
  fallback: string = '/assets/tulumba.png',
  backendUrl?: string
): string {
  // Return fallback if no image path
  if (!imagePath) return fallback;

  // If already a full URL (http/https), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a local asset path (starts with /assets), return as-is
  if (imagePath.startsWith('/assets')) {
    return imagePath;
  }

  // Construct full URL for backend uploads
  const baseUrl = getBackendUrl(backendUrl);
  // Ensure single slash between base URL and path
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Get product image URL from product image array
 * @param images - Array of image paths from product
 * @param index - Index of image to get (default: 0)
 * @param fallback - Fallback image path
 * @param backendUrl - Optional backend URL override
 * @returns Full URL to the product image
 */
export function getProductImageUrl(
  images: string[] | undefined | null,
  index: number = 0,
  fallback: string = '/assets/tulumba.png',
  backendUrl?: string
): string {
  const imagePath = images && images.length > index ? images[index] : undefined;
  return getImageUrl(imagePath, fallback, backendUrl);
}
