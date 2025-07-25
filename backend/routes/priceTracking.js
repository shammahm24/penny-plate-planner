const express = require('express');
const router = express.Router();
const PriceTracking = require('../models/PriceTracking');

// Get all price tracking entries
router.get('/', async (req, res) => {
  try {
    const prices = await PriceTracking.find();
    res.json(prices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get price tracking by item_name
router.get('/:item_name', async (req, res) => {
  try {
    const price = await PriceTracking.findOne({ item_name: req.params.item_name });
    if (!price) return res.status(404).json({ message: 'Item not found' });
    res.json(price);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create price tracking entry
router.post('/', async (req, res) => {
  try {
    const price = new PriceTracking(req.body);
    await price.save();
    res.status(201).json(price);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update price tracking by item_name
router.put('/:item_name', async (req, res) => {
  try {
    const price = await PriceTracking.findOneAndUpdate({ item_name: req.params.item_name }, req.body, { new: true });
    if (!price) return res.status(404).json({ message: 'Item not found' });
    res.json(price);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete price tracking by item_name
router.delete('/:item_name', async (req, res) => {
  try {
    const price = await PriceTracking.findOneAndDelete({ item_name: req.params.item_name });
    if (!price) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 