export function getListingImageSrc(photoPath: string): string {
  if (!photoPath) return '';

  const normalizedPath = photoPath.replace(/\\/g, '/');

  if (/^(https?:)?\/\//.test(normalizedPath) || normalizedPath.startsWith('data:')) {
    return normalizedPath;
  }

  if (normalizedPath.startsWith('/public/')) {
    return normalizedPath;
  }

  if (normalizedPath.startsWith('public/')) {
    return `/${normalizedPath}`;
  }

  if (normalizedPath.startsWith('uploads/')) {
    return `/public/${normalizedPath}`;
  }

  return normalizedPath;
}

