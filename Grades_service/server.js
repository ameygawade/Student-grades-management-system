const express = require('express');
const app = express();
app.use(express.json());

let grades = [];

// POST /grades - Add a grade
app.post('/grades', (req, res) => {
    const grade = req.body;
    grades.push(grade);
    res.status(201).json(grade);
});

// GET /grades - Retrieve all grades
app.get('/grades', (req, res) => res.json(grades));

app.listen(3001, () => console.log('Grades Service listening on port 3001'));
