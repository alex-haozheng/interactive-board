const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
const gridWidth = canvas.width;
const gridHeight = canvas.height;


// Array to store points locally
// const points = [];

// Function to update the plot with new points
function updatePlot() {
    // const canvas = document.getElementById('whiteboard');
    // const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas first

    drawGrid(ctx);

    // Call find_skyline_points function and handle its result
    fetch('/findSkylinePoints', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error fetching skyline points');
        }
        return response.json(); // Assuming the endpoint returns JSON
    })
    .then(skylinePoints => {
        console.log("Skyline points received:", skylinePoints);

        // Define an array of colors for each skyline layer
        const colors = ['red', 'blue', 'green', 'purple'];

        skylinePoints.forEach((layer, layerIndex) => {
            // Skip stroking/lining for the last layer
            if (layerIndex === skylinePoints.length - 1) {
                return; // Skip the last layer for stroking/lining
            }

            // Sort points in this layer by y-coordinate in descending order (or any custom rule)
            layer.sort((a, b) => b.y - a.y); // Sort by y-coordinate for skyline (higher y first)

            // Determine the color for this layer using the layerIndex
            const color = colors[layerIndex % colors.length];

            // Start drawing the trace for this layer
            ctx.beginPath();

            // Move to the first point in the layer to start the path
            ctx.moveTo(layer[0].x, layer[0].y);

            // Iterate through each point in the sorted layer and draw a line to the next point
            layer.forEach((point, pointIndex) => {
                if (pointIndex !== 0) {
                    ctx.lineTo(point.x, point.y); // Draw a line to the next point
                }
            });

            ctx.strokeStyle = `${color}`;
            ctx.lineWidth = 12; 
            ctx.stroke();

            // After drawing the trace, draw the points in the layer
            layer.forEach(point => {
                drawPoint(point.x, point.y, color); // Draw points with the same color as the trace
            });
        });

        // Finally, draw points for the last layer without stroking/lining
        const lastLayer = skylinePoints[skylinePoints.length - 1];
        const lastColor = colors[(skylinePoints.length - 1) % colors.length];

        // Draw the points for the last layer without connecting them
        lastLayer.forEach(point => {
            drawPoint(point.x, point.y, lastColor); // Just draw the points for the last layer
        });
    })
    .catch(error => console.error('Error finding skyline points:', error));
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
    // points.push(point);
    sendPointToBackend(point);
    // console.log(points.length)

    // Draw the point on the canvas
    drawPoint(x, y);
});

// Function to draw a point
function drawPoint(x, y, color='red') {
    ctx.beginPath();
    ctx.arc(x, y, 3.1, 0, 2 * Math.PI);
    ctx.fillStyle = color;
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
        updatePlot()
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
    // points.length = 0;

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

    fetch('/generatePoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ N: numPoints }), 
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error('Error generating points');
        }
        return response.json();
    })
    .then((newPoints) => {
        console.log('Backend response:', newPoints);
        updatePlot(); 
    })
    .catch((error) => console.error('Error:', error));
});


window.onload = function() {
    // Fetch the points from the backend when the page loads
    fetch('/points')
    .then((response) => response.json())
    .then((data) => {
        console.log('Initial points:', data);
        updatePlot();  // Update the plot with the initial points
    })
    .catch((error) => console.error('Error fetching points:', error));
}