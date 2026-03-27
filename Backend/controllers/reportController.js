const Report = require('../models/Report');

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private/Responder
const getReports = async (req, res) => {
  try {
    const { status, damage_type, urgency } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (damage_type) filters.damage_type = damage_type;
    if (urgency) filters.urgency = urgency;
    
    const reports = await Report.findAll(filters);
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user's reports
// @route   GET /api/reports/my-reports
// @access  Private
const getMyReports = async (req, res) => {
  try {
    const reports = await Report.findByUserId(req.user.id);
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create report
// @route   POST /api/reports
// @access  Private
const createReport = async (req, res) => {
  try {
    const { address, damage_type, description, urgency, lat, lng } = req.body;
    
    const reportId = await Report.create({
      user_id: req.user.id,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      address,
      damage_type,
      description,
      urgency
    });
    
    const report = await Report.findById(reportId);
    res.status(201).json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update report status
// @route   PUT /api/reports/:id/status
// @access  Private/Responder
const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const success = await Report.updateStatus(req.params.id, status);
    
    if (!success) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    const report = await Report.findById(req.params.id);
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get reports near location
// @route   GET /api/reports/nearby
// @access  Private/Responder
const getNearbyReports = async (req, res) => {
  try {
    const { lat, lng, radius = 50, status = 'pending' } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
    
    const reports = await Report.findNearby(
      parseFloat(lat), 
      parseFloat(lng), 
      parseFloat(radius),
      status
    );
    
    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getReports,
  getMyReports,
  createReport,
  updateReportStatus,
  getNearbyReports
};