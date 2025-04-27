const express = require('express');
const router = express.Router();
const User = require('../models/Usermodel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create a new user
router.post('/register', async (req, res) => {
    try {
        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const userData = {
            ...req.body,
            passwordHash: hashedPassword,
            createdBy: req.body.createdBy || null,
            updatedBy: req.body.createdBy || null
        };

        // Remove user_id if present to avoid primary key violation
        if (userData.user_id) {
            delete userData.user_id;
        }

        const newUser = await User.createUser(userData);
        res.status(201).json({
            success: true,
            data: newUser
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
});

// Login user
// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        // Find user by email
        const user = await User.getUserByEmail(email);
       
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        const isMatch = await bcrypt.compare(password, user.password_hash)

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        // Check if JWT_SECRET is defined
        const jwtSecret = process.env.JWT_SECRET 
        
        // Generate JWT
        const token = jwt.sign(
            { userId: user.user_id, email: user.email },
            jwtSecret,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            success: true,
            token,
            user,
            message: 'Login successful'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});
// Get user by ID
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.getUserById(req.params.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// Update user
router.put('/:userId', async (req, res) => {
    try {
        const updatedUser = await User.updateUser(req.params.userId, {
            ...req.body,
            updatedBy: req.body.updatedBy || null
        });
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: updatedUser
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            error: err.message
        });
    }
});

// Verify email
router.post('/:userId/verify-email', async (req, res) => {
    try {
        const user = await User.verifyEmail(req.params.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// Verify phone
router.post('/:userId/verify-phone', async (req, res) => {
    try {
        const user = await User.verifyPhone(req.params.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// Delete (deactivate) user
router.delete('/:userId', async (req, res) => {
    try {
        const user = await User.deleteUser(req.params.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'User deactivated successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});
// Signup Route
router.post('/signup', async (req, res) => {
    const {
        firstName,
        lastName,
        dateOfBirth,
        gender,
        phone,
        alternatePhone,
        email,
        street,
        city,
        state,
        zipCode,
        country,
        username,
        password,
        confirmPassword,
        role
    } = req.body;

    try {
        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: 'Passwords do not match' });
        }

        // Check if the user already exists
        const existingUser = await User.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Log actual structure of req.body to debug
        console.log("Original request body:", req.body);
        
        // Create a new user with a direct object that matches the expected parameter structure
        const userData = {
            firstName: req.body.firstName || req.body.first_name,
            lastName: req.body.lastName || req.body.last_name,
            dateOfBirth: req.body.dateOfBirth || req.body.date_of_birth,
            gender: req.body.gender,
            phone: req.body.phone,
            alternatePhone: req.body.alternatePhone || req.body.alternate_phone,
            email: req.body.email,
            street: req.body.street,
            city: req.body.city,
            state: req.body.state,
            zipCode: req.body.zipCode || req.body.zip_code,
            country: req.body.country,
            username: req.body.username,
            password: hashedPassword,
            role: req.body.role
        };
        
        console.log("Data being passed to createUser:", userData);
        
        const newUser = await User.createUser(userData);

        res.status(201).json({ success: true, message: 'User registered successfully', data: newUser });
    } catch (err) {
        console.log("Error details:", err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});

module.exports = router;