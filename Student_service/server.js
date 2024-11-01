const express = require('express');
const { v4: uuidv4 } = require('uuid');  // Import UUID library
const app = express();

app.use(express.json());

const students = [];  // In-memory storage for students

// GET /students - Retrieve all students
app.get('/students', (req, res) => res.json(students));

// POST /students - Add a new student
app.post('/students', (req, res) => {
    const student = { id: uuidv4(), ...req.body };  // Generate unique id for each student
    students.push(student);
    res.status(201).json(student);
});

// DELETE /students/id/:id - Delete a student by ID
app.delete('/students/id/:id', (req, res) => {
    const { id } = req.params;
    const index = students.findIndex(student => student.id === id);

    if (index !== -1) {
        const deletedStudent = students.splice(index, 1);  // Remove student from array
        res.json({ message: "Student deleted successfully", student: deletedStudent[0] });
    } else {
        res.status(404).json({ message: "Student not found" });
    }
});

app.listen(3000, () => console.log('Student Service listening on port 3000'));
