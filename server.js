const express = require('express');
const app = express();
const port = 3000;

// Store points in-memory
const points = [];

// Middleware to parse JSON
app.use(express.json());

// Serve the frontend
app.use(express.static('public')); // Place the HTML file in a "public" folder

// Endpoint to handle incoming points
app.post('/points', (req, res) => {
    const point = req.body;
    if (point && point.x !== undefined && point.y !== undefined) {
        points.push(point); // Add point to the list
        console.log('Point received:', point);
        res.json({ success: true, points }); // Respond with updated points
    } else {
        res.status(400).json({ success: false, message: 'Invalid point data' });
    }
});

// Endpoint to fetch all points (optional for debugging or refreshing frontend)
app.get('/points', (req, res) => {
    res.json(points);
});

// Endpoint to clear points
app.post('/clear-points', (req, res) => {
    points.length = 0;
    console.log('All points cleared');
    res.json({ success: true, message: 'All points cleared' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
