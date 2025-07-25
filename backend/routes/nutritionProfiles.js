const express = require('express');
const router = express.Router();
const NutritionProfile = require('../models/NutritionProfile');

// Get all nutrition profiles
router.get('/', async (req, res) => {
  try {
    const profiles = await NutritionProfile.find();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get nutrition profiles by user_id
router.get('/:user_id', async (req, res) => {
  try {
    const profiles = await NutritionProfile.find({ user_id: req.params.user_id });
    if (!profiles.length) return res.status(404).json({ message: 'Profiles not found' });
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create nutrition profile
router.post('/', async (req, res) => {
  try {
    const profile = new NutritionProfile(req.body);
    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update nutrition profile by _id
router.put('/:id', async (req, res) => {
  try {
    const profile = await NutritionProfile.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete nutrition profile by _id
router.delete('/:id', async (req, res) => {
  try {
    const profile = await NutritionProfile.findByIdAndDelete(req.params.id);
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json({ message: 'Profile deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 