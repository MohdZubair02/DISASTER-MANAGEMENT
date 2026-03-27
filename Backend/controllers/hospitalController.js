const Hospital = require('../models/Hospital');

// @desc    Get all hospitals
// @route   GET /api/hospitals
// @access  Public
const getHospitals = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    
    let hospitals;
    if (lat && lng) {
      hospitals = await Hospital.findNearby(parseFloat(lat), parseFloat(lng), parseFloat(radius));
    } else {
      hospitals = await Hospital.findAll();
    }
    
    res.json(hospitals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get single hospital
// @route   GET /api/hospitals/:id
// @access  Public
const getHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    
    if (!hospital) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    
    res.json(hospital);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create hospital
// @route   POST /api/hospitals
// @access  Private/Admin
const createHospital = async (req, res) => {
  try {
    const hospitalId = await Hospital.create(req.body);
    const hospital = await Hospital.findById(hospitalId);
    
    res.status(201).json(hospital);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update hospital
// @route   PUT /api/hospitals/:id
// @access  Private/Admin
const updateHospital = async (req, res) => {
  try {
    const success = await Hospital.update(req.params.id, req.body);
    
    if (!success) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    
    const hospital = await Hospital.findById(req.params.id);
    res.json(hospital);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete hospital
// @route   DELETE /api/hospitals/:id
// @access  Private/Admin
const deleteHospital = async (req, res) => {
  try {
    const success = await Hospital.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ message: 'Hospital not found' });
    }
    
    res.json({ message: 'Hospital removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getHospitals,
  getHospital,
  createHospital,
  updateHospital,
  deleteHospital
};