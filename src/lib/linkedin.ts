/**
 * Fetch profile photo
 *
 * Returns the profile photo URL for mhsenam
 * The photo is stored locally in the public folder.
 *
 * @returns Promise<string> - The URL of the profile picture
 */
export async function getProfilePhoto(): Promise<string> {
  // Profile photo stored locally
  // To update: replace the file at /public/profile-photo.png
  return "/profile-photo.png";
}
