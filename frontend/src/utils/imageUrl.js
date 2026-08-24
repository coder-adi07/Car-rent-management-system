/**
 * Utility to format image URLs from backend relative paths to full backend URLs
 * @param {string} path - Image path (e.g., '/uploads/cars/toyota-axio-01.jpg' or full HTTP URL)
 * @returns {string|null} Full image URL
 */
export const getImageUrl = (path) => {
  if (!path) return null;
  
  // If it's already a full HTTP/HTTPS URL or data URI, return as-is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  // Get backend base URL by stripping /api from VITE_API_URL
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const serverBase = apiBase.replace(/\/api\/?$/, '');

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${serverBase}${cleanPath}`;
};

export default getImageUrl;
