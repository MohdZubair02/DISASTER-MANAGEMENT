const Shelter = require('../models/Shelter');

// @desc    Get all shelters
// @route   GET /api/shelters
// @access  Public
const getShelters = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    
    let shelters;
    if (lat && lng) {
      shelters = await Shelter.findNearby(parseFloat(lat), parseFloat(lng), parseFloat(radius));
    } else {
      shelters = await Shelter.findAll();
    }
    
    res.json(shelters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single shelter
// @route   GET /api/shelters/:id
// @access  Public
const getShelter = async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    
    if (!shelter) {
      return res.status(404).json({ message: 'Shelter not found' });
    }
    
    res.json(shelter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create shelter
// @route   POST /api/shelters
// @access  Private/Admin
const createShelter = async (req, res) => {
  try {
    const shelterId = await Shelter.create(req.body);
    const shelter = await Shelter.findById(shelterId);
    
    res.status(201).json(shelter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update shelter
// @route   PUT /api/shelters/:id
// @access  Private/Admin
const updateShelter = async (req, res) => {
  try {
    const success = await Shelter.update(req.params.id, req.body);
    
    if (!success) {
      return res.status(404).json({ message: 'Shelter not found' });
    }
    
    const shelter = await Shelter.findById(req.params.id);
    res.json(shelter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete shelter
// @route   DELETE /api/shelters/:id
// @access  Private/Admin
const deleteShelter = async (req, res) => {
  try {
    const success = await Shelter.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ message: 'Shelter not found' });
    }
    
    res.json({ message: 'Shelter removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getShelters,
  getShelter,
  createShelter,
  updateShelter,
  deleteShelter
};