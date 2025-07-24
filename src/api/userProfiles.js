import profiles from '../data/userProfiles.json';

let profilesData = [...profiles];

export function getProfileByUserId(userId) {
  return profilesData.find(p => p.user_id === userId);
}

export function createOrUpdateProfile(userId, profileData) {
  const existingIndex = profilesData.findIndex(p => p.user_id === userId);
  
  if (existingIndex !== -1) {
    profilesData[existingIndex] = { user_id: userId, ...profileData };
    return profilesData[existingIndex];
  } else {
    const newProfile = { user_id: userId, ...profileData };
    profilesData.push(newProfile);
    return newProfile;
  }
}

export function getAllProfiles() {
  return profilesData;
}