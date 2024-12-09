from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

# store points in memory
points = []

# Test route to ensure the server is working
@app.route('/')
def home():
    return render_template('index.html')

# Endpoint to fetch all points (GET /points)
@app.route('/points', methods=['GET'])
def get_points():
    return jsonify(points)  # Return all stored points

@app.route('/points', methods=['POST'])
def add_points():
    data = request.json  # Get the JSON data
    print('received data:', data)
    if isinstance(data, list):  # Ensure data is a list of points
        valid_points = [point for point in data if 'x' in point and 'y' in point]
        points.extend(valid_points)  # Add the points to the global list
        print('Points received:', valid_points)
        return jsonify({'success': True, 'points': points})  # Respond with the updated list of points
    else:
        return jsonify({'success': False, 'message': 'Invalid data format, expected a list of points'}), 400

# Endpoint to clear points (POST /clear-points)
@app.route('/clear-points', methods=['POST'])
def clear_points():
    points.clear()  # Clear the list of points
    print('All points cleared')
    return jsonify({'success': True, 'message': 'All points cleared'})

# Run the Flask server
if __name__ == '__main__':
    app.run(debug=True, port=3000)
