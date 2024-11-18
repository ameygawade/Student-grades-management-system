// Load environment variables from .env file
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

// Grade Schema and Model
const gradeSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  subjectCode: { type: String, required: true },
  grade: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const Grade = mongoose.model('Grade', gradeSchema);

// Helper function to validate student existence
const validateStudent = async (studentId) => {
  try {
    const studentServiceURL = process.env.STUDENT_SERVICE_URL || 'http://localhost:3000';
    const response = await axios.get(`${studentServiceURL}/students/${studentId}`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

// Helper function to validate subject existence
const validateSubject = async (subjectCode) => {
  try {
    const subjectServiceURL = process.env.SUBJECT_SERVICE_URL || 'http://localhost:3002';
    const response = await axios.get(`${subjectServiceURL}/subjects/${subjectCode}`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

// POST /grades - Add a grade
app.post('/grades', async (req, res) => {
  const { studentId, subjectCode, grade } = req.body;

  // Verify if the student exists
  const studentExists = await validateStudent(studentId);
  if (!studentExists) {
    return res.status(404).json({ message: 'Student not found' });
  }

  // Verify if the subject exists
  const subjectExists = await validateSubject(subjectCode);
  if (!subjectExists) {
    return res.status(404).json({ message: 'Subject not found' });
  }

  try {
    const newGrade = new Grade({ studentId, subjectCode, grade });
    await newGrade.save();
    res.status(201).json(newGrade);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /grades - Retrieve all grades
app.get('/grades', async (req, res) => {
  try {
    const grades = await Grade.find();
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching grades', error: error.message });
  }
});

// GET /grades/:studentId - Retrieve grades for a specific student
app.get('/grades/:studentId', async (req, res) => {
  const { studentId } = req.params;

  // Validate student existence
  const studentExists = await validateStudent(studentId);
  if (!studentExists) {
    return res.status(404).json({ message: 'Student not found' });
  }

  try {
    const grades = await Grade.find({ studentId });
    res.json(grades);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching grades for student', error: error.message });
  }
});

// GET /grades/:subjectCode - Retrieve grades for a specific subject
app.get('/grades/subject/:subjectCode', async (req, res) => {
  const { subjectCode } = req.params;

  // Validate subject existence
  const subjectExists = await validateSubject(subjectCode);
  if (!subjectExists) {
    return res.status(404).json({ message: 'Subject not found' });
  }

  try {
    const grades = await Grade.find({ subjectCode });
    res.json(grades);
  } catch (error) {
    console.error('Error fetching grades for subject:', error.message);
    res.status(500).json({ message: 'Error fetching grades for subject', error: error.message });
  }
});

// PUT /grades/:id - Update a grade
app.put('/grades/:id', async (req, res) => {
  const { id } = req.params;
  const { studentId, subjectCode, grade } = req.body;

  // Verify if the grade entry exists
  const gradeEntry = await Grade.findById(id);
  if (!gradeEntry) {
    return res.status(404).json({ message: 'Grade entry not found' });
  }

  // Verify if the student exists
  if (studentId && studentId !== gradeEntry.studentId) {
    const studentExists = await validateStudent(studentId);
    if (!studentExists) {
      return res.status(404).json({ message: 'Student not found' });
    }
  }

  // Verify if the subject exists
  if (subjectCode && subjectCode !== gradeEntry.subjectCode) {
    const subjectExists = await validateSubject(subjectCode);
    if (!subjectExists) {
      return res.status(404).json({ message: 'Subject not found' });
    }
  }

  try {
    const updatedGrade = await Grade.findByIdAndUpdate(
      id,
      { studentId, subjectCode, grade },
      { new: true, runValidators: true }
    );
    res.json(updatedGrade);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// DELETE /grades/:id - Delete a grade
app.delete('/grades/:id', async (req, res) => {
  const { id } = req.params;

  // Verify if the grade entry exists
  const gradeEntry = await Grade.findById(id);
  if (!gradeEntry) {
    return res.status(404).json({ message: 'Grade entry not found' });
  }

  try {
    await Grade.findByIdAndDelete(id);
    res.json({ message: 'Grade entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




// Start the service
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Grades Service running on http://localhost:${PORT}`));
