const express = require('express');
const router = express.Router();
const Patient = require('../models/patientmodel');

// Create a new patient
router.post('/', async (req, res) => {
    try {
        const newPatient = await Patient.createPatient(req.body);
        res.status(201).json({
            success: true,
            data: newPatient
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
});

// Get patient by ID
router.get('/:patientId', async (req, res) => {
    try {
        const patient = await Patient.getPatientById(req.params.patientId);
        if (!patient) {
            return res.status(404).json({
                success: false,
                error: 'Patient not found'
            });
        }
        res.status(200).json({
            success: true,
            data: patient
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// Get patient by user ID
router.get('/user/:userId', async (req, res) => {
    try {
        const patient = await Patient.getPatientByUserId(req.params.userId);
        if (!patient) {
            return res.status(404).json({
                success: false,
                error: 'Patient not found'
            });
        }
        res.status(200).json({
            success: true,
            data: patient
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// Update patient
router.put('/:patientId', async (req, res) => {
    try {
        const updatedPatient = await Patient.updatePatient(req.params.patientId, req.body);
        if (!updatedPatient) {
            return res.status(404).json({
                success: false,
                error: 'Patient not found'
            });
        }
        res.status(200).json({
            success: true,
            data: updatedPatient
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
});

// Delete patient
router.delete('/:patientId', async (req, res) => {
    try {
        const patient = await Patient.deletePatient(req.params.patientId);
        if (!patient) {
            return res.status(404).json({
                success: false,
                error: 'Patient not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Patient deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// Update EMR access
router.put('/:patientId/emr-access', async (req, res) => {
    try {
        const { token, expiry } = req.body;
        const patient = await Patient.updateEmrAccess(req.params.patientId, token, expiry);
        if (!patient) {
            return res.status(404).json({
                success: false,
                error: 'Patient not found'
            });
        }
        res.status(200).json({
            success: true,
            data: patient
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = router;