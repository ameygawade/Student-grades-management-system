const express = require('express');
const app = express();
app.use(express.json());

app.get('/students', (req, res) => res.send('Student data'));
app.listen(3000, () => console.log('Student Service listening on port 3000'));
