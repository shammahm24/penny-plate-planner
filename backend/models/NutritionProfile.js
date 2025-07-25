const mongoose = require('mongoose');

const nutritionProfileSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  food_name: { type: String, required: true },
  nutrition_score: { type: Number },
  rank: { type: Number },
  category: { type: String },
  monthly_spend: { type: Number }
});

module.exports = mongoose.model('NutritionProfile', nutritionProfileSchema); 