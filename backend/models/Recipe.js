const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user_id: { type: String, required: true },
  name: { type: String, required: true },
  ingredients: [String],
  instructions: { type: String },
  is_recommended: { type: Boolean, default: false },
  estimated_cost: { type: Number },
  nutrition_score: { type: Number }
});

module.exports = mongoose.model('Recipe', recipeSchema); 