const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  store: { type: String, required: true },
  price: { type: Number, required: true },
  date: { type: String, required: true }
}, { _id: false });

const priceTrackingSchema = new mongoose.Schema({
  item_name: { type: String, required: true, unique: true },
  price_history: [priceHistorySchema],
  recommended_substitute: { type: String }
});

module.exports = mongoose.model('PriceTracking', priceTrackingSchema); 