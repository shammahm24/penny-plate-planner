const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');

// Get all user profiles
router.get('/', async (req, res) => {
  try {
    const profiles = await UserProfile.find();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user profile by user_id
router.get('/:user_id', async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ user_id: req.params.user_id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create user profile
router.post('/', async (req, res) => {
  try {
    const profile = new UserProfile(req.body);
    await profile.save();
    res.status(201).json(profile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update user profile
router.put('/:user_id', async (req, res) => {
  try {
    const profile = await UserProfile.findOneAndUpdate({ user_id: req.params.user_id }, req.body, { new: true });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete user profile
router.delete('/:user_id', async (req, res) => {
  try {
    const profile = await UserProfile.findOneAndDelete({ user_id: req.params.user_id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json({ message: 'Profile deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 