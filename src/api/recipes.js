import recipes from '../data/recipes.json';

let recipesData = [...recipes];

export function getRecipesByUserId(userId) {
  return recipesData.filter(r => r.user_id === userId);
}

export function getRecommendedRecipes(userId) {
  return recipesData.filter(r => r.user_id === userId && r.is_recommended);
}

export function getAllRecipes() {
  return recipesData;
}

export function addRecipe(recipeData) {
  const newRecipe = {
    id: `r${Date.now()}`,
    ...recipeData
  };
  recipesData.push(newRecipe);
  return newRecipe;
}