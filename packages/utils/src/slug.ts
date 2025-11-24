/**
 * Generate a URL-friendly slug from text
 * Handles Turkish characters and special characters
 */
export function generateSlug(text: string): string {
  // Turkish character replacement map
  const turkishMap: Record<string, string> = {
    'ç': 'c', 'Ç': 'C',
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'İ': 'I',
    'ö': 'o', 'Ö': 'O',
    'ş': 's', 'Ş': 'S',
    'ü': 'u', 'Ü': 'U'
  };

  let slug = text.toLowerCase();

  // Replace Turkish characters
  Object.keys(turkishMap).forEach(key => {
    slug = slug.replace(new RegExp(key, 'g'), turkishMap[key]);
  });

  // Replace spaces and special chars with dash
  slug = slug
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug;
}
