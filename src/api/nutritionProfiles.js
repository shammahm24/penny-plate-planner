import profiles from '../data/nutritionProfiles.json';

let nutritionData = [...profiles];

export function getNutritionProfileByUserId(userId) {
  return nutritionData.filter(n => n.user_id === userId);
}

export function getTopFoodsByUserId(userId, limit = 10) {
  return nutritionData
    .filter(n => n.user_id === userId)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit);
}

export function addNutritionEntry(userId, foodData) {
  const newEntry = {
    user_id: userId,
    ...foodData,
    rank: nutritionData.filter(n => n.user_id === userId).length + 1
  };
  nutritionData.push(newEntry);
  return newEntry;
}