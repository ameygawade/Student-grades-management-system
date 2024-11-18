// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

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

// Student Schema and Model
const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  age: { type: Number, required: true },
});

const Student = mongoose.model('Student', studentSchema);

// POST /students - Add a new student
// POST /students - Add a new student
app.post('/students', async (req, res) => {
  const { studentId, name, age } = req.body;

  try {
    // Check if student already exists
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(409).json({ message: 'Student with this ID already exists' });
    }

    const student = new Student({ studentId, name, age });
    await student.save();
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /students - Retrieve all students
app.get('/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /students/:studentId - Retrieve a student by ID
app.get('/students/:studentId', async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId });
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /students/:studentId - Update a student's information
app.put('/students/:studentId', async (req, res) => {
  const { studentId } = req.params;
  const { name, age } = req.body;

  try {
    const updatedStudent = await Student.findOneAndUpdate(
      { studentId },
      { name, age },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(updatedStudent);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// DELETE /students/:studentId - Delete a student
app.delete('/students/:studentId', async (req, res) => {
  const { studentId } = req.params;

  try {
    const deletedStudent = await Student.findOneAndDelete({ studentId });

    if (!deletedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Student Service running on http://localhost:${PORT}`));
