import numpy as np
import pandas as pd
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

np.random.seed(8)
# store points in memory
points = []
nonskyline_points = []

def generate_data(N, global_seed=8):
    # Define proportions of each cluster
    
    proportion_1 = 0.9  # 90% of the points in the first cluster
    proportion_2 = 0.1  # 10% of the points in the second cluster

    # Calculate the number of points in each cluster
    N_1 = int(N * proportion_1)
    N_2 = N - N_1

    # Define means and standard deviations for two clusters
    #         X,  Y
    mean_1 = [600, 400]
    std_1 = [120, 220]
    mean_2 = [420, 410]
    std_2 = [200, 200]

    # Generate points for each cluster
    cluster_1 = np.random.normal(loc=mean_1, scale=std_1, size=(N_1, 2))
    cluster_2 = np.random.normal(loc=mean_2, scale=std_2, size=(N_2, 2))

    # Combine the clusters to form the dataset
    data = np.vstack([cluster_1, cluster_2])

    # Create a DataFrame
    df = pd.DataFrame(data, columns=['x', 'y'])
    # Filter out rows where 'X' or 'Y' are less than or equal to zero
    df = df[(df['x'] > 0) & (df['y'] > 0)]

    # Filter out rows where 'X' or 'Y' are greater than 60
    df = df[(df['x'] <= 1000) & (df['y'] <= 1000)]

    return df

def find_skyline_points_in_net(points):
    # Initialize an empty list to hold the skyline points
    skyline = []
    for point in points:
        dominated = False
        for other_point in points:
            # Check for domination based on updated criteria
            if (other_point['x'] < point['x'] and other_point['y'] > point['y']):
                dominated = True
                break
        if not dominated:
            skyline.append(point)
            
    nonskyline = [point for point in points if point not in skyline]
    return skyline, nonskyline

def find_all_orders_skyline(data, max_order=3):
    # This will store the lists of skyline points for each order
    all_skyline_points = []
    current_data = data[:]  # Create a copy of the list to work on

    for _ in range(1, max_order + 1):
        skyline, nonskyline = find_skyline_points_in_net(current_data)
        if not skyline:  # Break if no skyline points are found
            break
        all_skyline_points.append(skyline)
        # Remove skyline points from current data
        current_data = [point for point in current_data if point not in skyline]
    all_skyline_points.append(nonskyline) # appending nonskyline
    return all_skyline_points

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

@app.route('/totalPoints', methods=['GET'])
def get_totalPoints():
    print('total points:', len(points))
    return jsonify(len(points))

@app.route('/generatePoints', methods=['POST'])
def generate_points():
    data = request.json
    N = data.get('N', 0)
    print(f'received N at backend: {N}')
    
    if N <= 0:
        return jsonify({'error': 'Invalid number of points'}), 400
    
    new_points = generate_data(N)
    npts = new_points.to_dict(orient='records')
    
    points.extend(npts)
    
    return jsonify(points)
    

@app.route('/findSkylinePoints', methods=['GET'])
def find_skyline_points_endpoint():
    skyline_points = find_all_orders_skyline(points)  # Call your function
    return jsonify(skyline_points)  # list of list of dictionaries(points)

# Endpoint to clear points (POST /clear-points)
@app.route('/clear-points', methods=['POST'])
def clear_points():
    points.clear()  # Clear the list of points
    print('All points cleared')
    return jsonify({'success': True, 'message': 'All points cleared'})

# Run the Flask server
if __name__ == '__main__':
    app.run(debug=True, port=3000)
