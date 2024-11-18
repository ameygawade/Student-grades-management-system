// Load environment variables
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error('Error: MONGO_URI is not defined in the environment variables.');
    process.exit(1);
}

mongoose.set('strictQuery', true);

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    });

// Subject Schema and Model
const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },
    studentId: { type: String }, // Optional: Link subject to a student
});

const Subject = mongoose.model('Subject', subjectSchema);

// Helper function to validate student existence
const validateStudent = async (studentId) => {
    try {
        const studentServiceURL = process.env.STUDENT_SERVICE_URL || 'http://localhost:3000';
        const response = await axios.get(`${studentServiceURL}/students/${studentId}`);
        return response.status === 200;
    } catch (error) {
        console.error('Error validating student:', error.message);
        return false;
    }
};

// REST API Endpoints

// POST /subjects - Add a new subject
app.post('/subjects', async (req, res) => {
    const { name, code, description, studentId } = req.body;

    // Validate associated student if studentId is provided
    if (studentId) {
        const studentExists = await validateStudent(studentId);
        if (!studentExists) {
            return res.status(404).json({ message: 'Student not found' });
        }
    }

    try {
        const newSubject = new Subject({ name, code, description, studentId });
        await newSubject.save();
        res.status(201).json(newSubject);
    } catch (error) {
        console.error('Error saving subject:', error.message);
        res.status(400).json({ error: error.message });
    }
});

// GET /subjects - Retrieve all subjects
app.get('/subjects', async (req, res) => {
    try {
        const subjects = await Subject.find();
        res.json(subjects);
    } catch (error) {
        console.error('Error fetching subjects:', error.message);
        res.status(500).json({ message: 'Error fetching subjects', error: error.message });
    }
});

// GET /subjects/:code - Retrieve a subject by code
app.get('/subjects/:code', async (req, res) => {
    const { code } = req.params;

    try {
        const subject = await Subject.findOne({ code });
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.json(subject);
    } catch (error) {
        console.error('Error fetching subject:', error.message);
        res.status(500).json({ message: 'Error fetching subject', error: error.message });
    }
});

// DELETE /subjects/:code - Delete a subject by code
app.delete('/subjects/:code', async (req, res) => {
    const { code } = req.params;

    try {
        const subject = await Subject.findOneAndDelete({ code });
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.status(204).send(); // No content
    } catch (error) {
        console.error('Error deleting subject:', error.message);
        res.status(500).json({ message: 'Error deleting subject', error: error.message });
    }
});

// PUT /subjects/:code - Update a subject's information
app.put('/subjects/:code', async (req, res) => {
    const { code } = req.params;
    const { name, description, studentId } = req.body;
  
    // Validate associated student if studentId is provided
    if (studentId) {
      const studentExists = await validateStudent(studentId);
      if (!studentExists) {
        return res.status(404).json({ message: 'Student not found' });
      }
    }
  
    try {
      const updatedSubject = await Subject.findOneAndUpdate(
        { code },
        { name, description, studentId },
        { new: true, runValidators: true }
      );
  
      if (!updatedSubject) {
        return res.status(404).json({ message: 'Subject not found' });
      }
  
      res.json(updatedSubject);
    } catch (error) {
      console.error('Error updating subject:', error.message);
      res.status(400).json({ error: error.message });
    }
  });


// DELETE /subjects/:code - Delete a subject by code
app.delete('/subjects/:code', async (req, res) => {
    const { code } = req.params;
  
    try {
      const deletedSubject = await Subject.findOneAndDelete({ code });
  
      if (!deletedSubject) {
        return res.status(404).json({ message: 'Subject not found' });
      }
  
      res.json({ message: 'Subject deleted successfully' });
    } catch (error) {
      console.error('Error deleting subject:', error.message);
      res.status(500).json({ message: 'Error deleting subject', error: error.message });
    }
  });
  

// Start the service
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Subject Service running on port ${PORT}`));
