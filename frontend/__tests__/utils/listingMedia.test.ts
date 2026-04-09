import { describe, it, expect } from 'vitest';
import { getListingImageSrc } from '../../src/utils/listingMedia';

describe('getListingImageSrc', () => {
  it('should return an empty string if photoPath is null or undefined', () => {
    expect(getListingImageSrc('')).toBe('');
    expect(getListingImageSrc(null as any)).toBe('');
  });

  it('should normalize backslashes to forward slashes', () => {
    expect(getListingImageSrc('folder\\sub\\image.jpg')).toBe('folder/sub/image.jpg');
  });

  it('should return absolute URLs and Data URIs as-is', () => {
    expect(getListingImageSrc('https://example.com/img.png')).toBe('https://example.com/img.png');
    expect(getListingImageSrc('//example.com/img.png')).toBe('//example.com/img.png');
    expect(getListingImageSrc('data:image/png;base64,123')).toBe('data:image/png;base64,123');
  });

  it('should return paths starting with /public/ as-is', () => {
    expect(getListingImageSrc('/public/assets/logo.png')).toBe('/public/assets/logo.png');
  });

  it('should prepend a slash to paths starting with public/ (without leading slash)', () => {
    expect(getListingImageSrc('public/assets/logo.png')).toBe('/public/assets/logo.png');
  });

  it('should prepend /public/ to paths starting with uploads/', () => {
    expect(getListingImageSrc('uploads/vehicle_1.jpg')).toBe('/public/uploads/vehicle_1.jpg');
  });

  it('should return the normalized path as a fallback', () => {
    expect(getListingImageSrc('my-custom-folder/img.png')).toBe('my-custom-folder/img.png');
  });
});