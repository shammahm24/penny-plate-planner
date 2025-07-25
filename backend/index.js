require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const usersRouter = require('./routes/users');
console.log('Registering /api/users route');
app.use('/api/users', (req, res, next) => { console.log('Request to /api/users'); next(); }, usersRouter);

const userProfilesRouter = require('./routes/userProfiles');
console.log('Registering /api/user-profiles route');
app.use('/api/user-profiles', (req, res, next) => { console.log('Request to /api/user-profiles'); next(); }, userProfilesRouter);

const recipesRouter = require('./routes/recipes');
console.log('Registering /api/recipes route');
app.use('/api/recipes', (req, res, next) => { console.log('Request to /api/recipes'); next(); }, recipesRouter);

const nutritionProfilesRouter = require('./routes/nutritionProfiles');
console.log('Registering /api/nutrition-profiles route');
app.use('/api/nutrition-profiles', (req, res, next) => { console.log('Request to /api/nutrition-profiles'); next(); }, nutritionProfilesRouter);

const priceTrackingRouter = require('./routes/priceTracking');
console.log('Registering /api/price-tracking route');
app.use('/api/price-tracking', (req, res, next) => { console.log('Request to /api/price-tracking'); next(); }, priceTrackingRouter);

app.get('/', (req, res) => {
  res.send('Bread & Butter Backend API');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
