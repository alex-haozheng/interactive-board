const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');

// Array to store points locally
const points = [];

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

    // Draw the point on the canvas
    drawPoint(x, y);
});

// Function to draw a point
function drawPoint(x, y) {
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.closePath();
}

// Function to send the point to the backend
function sendPointToBackend(point) {
    fetch('/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(point),
    })
    .then((response) => response.json())
    .then((data) => console.log('Backend response:', data))
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