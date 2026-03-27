const Alert = require('../models/Alert');

// @desc    Get all alerts
// @route   GET /api/alerts
// @access  Public
const getAlerts = async (req, res) => {
  try {
    const { active } = req.query;
    
    const filters = {};
    if (active !== undefined) {
      filters.is_active = active === 'true';
    }
    
    const alerts = await Alert.findAll(filters);
    res.json(alerts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get active alerts near location
// @route   GET /api/alerts/nearby
// @access  Public
const getNearbyAlerts = async (req, res) => {
  try {
    const { lat, lng, radius = 50 } = req.query;
    
    const alerts = await Alert.findNearby(
      lat ? parseFloat(lat) : null,
      lng ? parseFloat(lng) : null,
      parseFloat(radius),
      true
    );
    
    res.json(alerts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create alert
// @route   POST /api/alerts
// @access  Private/Admin
const createAlert = async (req, res) => {
  try {
    const alertId = await Alert.create(req.body);
    const alert = await Alert.findById(alertId);
    
    res.status(201).json(alert);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update alert
// @route   PUT /api/alerts/:id
// @access  Private/Admin
const updateAlert = async (req, res) => {
  try {
    const success = await Alert.update(req.params.id, req.body);
    
    if (!success) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    const alert = await Alert.findById(req.params.id);
    res.json(alert);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Private/Admin
const deleteAlert = async (req, res) => {
  try {
    const success = await Alert.delete(req.params.id);
    
    if (!success) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    res.json({ message: 'Alert removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getAlerts,
  getNearbyAlerts,
  createAlert,
  updateAlert,
  deleteAlert
};