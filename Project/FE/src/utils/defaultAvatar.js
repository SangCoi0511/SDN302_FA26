/**
 * @fileoverview Default Avatar Configuration
 *
 * Provides a consistent default avatar across the entire app.
 * Used when a user hasn't uploaded their own profile picture.
 *
 * @author San Sieu Toc Team
 */

/**
 * Default avatar URL — friendly green-themed user silhouette.
 * Uses DiceBear Avatars API for a consistent, attractive placeholder.
 */
export const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=User&background=00E536&color=fff&size=200&bold=true&format=svg';

/**
 * Get a personalised default avatar based on the user's name.
 * @param {string} [name] - User display name
 * @returns {string} avatar URL
 */
export const getDefaultAvatar = (name) => {
  const displayName = name && name.trim() ? name.trim() : 'User';
  const encoded = encodeURIComponent(displayName);
  return `https://ui-avatars.com/api/?name=${encoded}&background=00E536&color=fff&size=200&bold=true&format=svg`;
};

/**
 * Return the user's avatar or a personalised default.
 * @param {string} [image] - User's image URL
 * @param {string} [name]  - User's display name (for fallback)
 * @returns {string} avatar URL
 */
export const getUserAvatar = (image, name) => {
  if (image && image.trim() && !image.includes('via.placeholder.com')) {
    return image;
  }
  return getDefaultAvatar(name);
};
