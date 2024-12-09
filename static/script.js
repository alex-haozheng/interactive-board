const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
const gridWidth = canvas.width;
const gridHeight = canvas.height;


// Array to store points locally
const points = [];

// Function to update the plot with new points
function updatePlot(points) {
    // const canvas = document.getElementById('whiteboard');
    // const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas first

    drawGrid(ctx);
    // Loop through all the points and draw them
    points.forEach(point => {
        console.log("points received in update plot: ", point);
        drawPoint(point.x, point.y);
    });
}

// Draw grid lines (optional)
function drawGrid(ctx) {
    const gridSize = 10;  // Grid square size, you can adjust this
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;

    // Draw horizontal lines
    for (let y = 0; y <= ctx.canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ctx.canvas.width, y);
        ctx.stroke();
    }

    // Draw vertical lines
    for (let x = 0; x <= ctx.canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ctx.canvas.height);
        ctx.stroke();
    }
}

// Function to handle clicks on the canvas
canvas.addEventListener('click', (e) => {
    // Get mouse coordinates relative to the canvas
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Save the point and send it to the backend
    const point = { x, y };
    points.push(point);
    sendPointToBackend(point);
    console.log(points)

    // Draw the point on the canvas
    drawPoint(x, y);
});

// Function to draw a point
function drawPoint(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 2.1, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath();
}

// Function to send the point to the backend
function sendPointToBackend(point) {
    // console.log("points points", point);
    const pt = [point]
    fetch('/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pt),
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('huh??');
        }
        return response.json();
    })
    .then((data) => {
        console.log('Backend response:', data),
        updatePlot(data.points)
    })
    .catch((error) => console.error('Error sending point:', error));
}

// Get the clear button
const clearButton = document.getElementById('clearButton');

// Handle the "Clear" button click
clearButton.addEventListener('click', () => {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Clear the local points array
    points.length = 0;

    // Notify the backend to clear stored points
    fetch('/clear-points', { method: 'POST' })
        .then((response) => response.json())
        .then((data) => console.log('Points cleared:', data))
        .catch((error) => console.error('Error clearing points:', error));
});

document.getElementById('generatePointsBtn').addEventListener('click', () => {
    const numPointsInput = document.getElementById('numPoints');
    const numPoints = parseInt(numPointsInput.value, 10);

    if (!numPoints || numPoints <= 0) {
        alert('Please enter a valid number of points!');
        return;
    }

    // Generate random points
    const randomPoints = Array.from({ length: numPoints }, () => ({
        x: Math.floor(Math.random() * gridWidth), // Random x between 0 and 500
        y: Math.floor(Math.random() * gridHeight), // Random y between 0 and 500
    }));

    // Send random points to the backend
    fetch('/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(randomPoints), // Send the array of points
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('huh??');
        }
        return response.json();
    })
    .then((data) => {
        console.log('Backend response:', data),
        updatePlot(data.points)
    })
    .catch(error => console.error('Error:', error));
});


window.onload = function() {
    // Fetch the points from the backend when the page loads
    fetch('/points')
    .then((response) => response.json())
    .then((data) => {
        console.log('Initial points:', data);
        updatePlot(data);  // Update the plot with the initial points
    })
    .catch((error) => console.error('Error fetching points:', error));
}