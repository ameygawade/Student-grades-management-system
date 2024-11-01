const express = require('express');
const app = express();

app.use(express.json()); // Middleware to parse JSON requests

// Temporary in-memory storage for subjects
const subjects = [];

// GET /subjects - Retrieve list of subjects
app.get('/subjects', (req, res) => {
    res.json(subjects);
});

// POST /subjects - Add a new subject
app.post('/subjects', (req, res) => {
    const subject = req.body;  // Get subject data from request body
    subjects.push(subject);    // Add the new subject to the in-memory array
    res.status(201).json(subject);  // Respond with the added subject and status code 201 (Created)
});

// PUT /subjects/:id - Update a subject by ID
app.put('/subjects/:id', (req, res) => {
    const { id } = req.params;
    const updatedSubject = req.body;

    const index = subjects.findIndex(subject => subject.id === id);

    if (index !== -1) {
        subjects[index] = { ...subjects[index], ...updatedSubject };
        res.json(subjects[index]);
    } else {
        res.status(404).json({ message: "Subject not found" });
    }
});

// DELETE /subjects/:id - Delete a subject by ID
app.delete('/subjects/:id', (req, res) => {
    const { id } = req.params;
    const index = subjects.findIndex(subject => subject.id === id);

    if (index !== -1) {
        const deletedSubject = subjects.splice(index, 1); // Remove subject from array
        res.json({ message: "Subject deleted successfully", subject: deletedSubject[0] });
    } else {
        res.status(404).json({ message: "Subject not found" });
    }
});

app.listen(3002, () => console.log('Subject Service listening on port 3002'));
