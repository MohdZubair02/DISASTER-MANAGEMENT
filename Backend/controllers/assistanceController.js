const Assistance = require('../models/Assistance');

// @desc    Get all assistance requests
// @route   GET /api/assistance
// @access  Private/Responder
const getAssistanceRequests = async (req, res) => {
  try {
    const { status, assistance_type } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (assistance_type) filters.assistance_type = assistance_type;
    
    const requests = await Assistance.findAll(filters);
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user's assistance requests
// @route   GET /api/assistance/my-requests
// @access  Private
const getMyAssistanceRequests = async (req, res) => {
  try {
    const requests = await Assistance.findByUserId(req.user.id);
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create assistance request
// @route   POST /api/assistance
// @access  Private
const createAssistanceRequest = async (req, res) => {
  try {
    const { assistance_type, people_count, contact_info, address, additional_info, lat, lng } = req.body;
    
    const requestId = await Assistance.create({
      user_id: req.user.id,
      assistance_type,
      people_count: parseInt(people_count),
      contact_info,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      address,
      additional_info
    });
    
    const request = await Assistance.findById(requestId);
    res.status(201).json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update assistance request status
// @route   PUT /api/assistance/:id/status
// @access  Private/Responder
const updateAssistanceStatus = async (req, res) => {
  try {
    const { status, assigned_to } = req.body;
    
    const success = await Assistance.updateStatus(req.params.id, status, assigned_to);
    
    if (!success) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    const request = await Assistance.findById(req.params.id);
    res.json(request);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get assistance requests near location
// @route   GET /api/assistance/nearby
// @access  Private/Responder
const getNearbyAssistanceRequests = async (req, res) => {
  try {
    const { lat, lng, radius = 50, status = 'pending' } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
    
    const requests = await Assistance.findNearby(
      parseFloat(lat), 
      parseFloat(lng), 
      parseFloat(radius),
      status
    );
    
    res.json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getAssistanceRequests,
  getMyAssistanceRequests,
  createAssistanceRequest,
  updateAssistanceStatus,
  getNearbyAssistanceRequests
};