// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/user_routes'); // Import user routes
const app = express();
const pool=require("./db")


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded



// Test database connection
app.use("/api", userRoutes); // Use user routes


pool.connect((err, client, done) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Successfully connected to PostgreSQL database');
    done();
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

