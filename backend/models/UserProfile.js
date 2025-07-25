const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  user_id: { type: String, required: true, unique: true },
  food_budget: { type: Number, required: true },
  budget_frequency: { type: String, required: true },
  dietary_preferences: [String],
  nutrition_goals: { type: String },
  current_weight: { type: Number },
  activity_level: { type: String },
  height_cm: { type: Number },
  preferred_stores: [String]
});

module.exports = mongoose.model('UserProfile', userProfileSchema); 