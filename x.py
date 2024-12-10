import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

mean_1 = [35, 55]
std_1 = [10, 20]
mean_2 = [50, 150]
std_2 = [20, 30]

def generate_data(N, global_seed=1):
    # Define proportions of each cluster
    np.random.seed(global_seed)
    proportion_1 = 0.9  # 90% of the points in the first cluster
    proportion_2 = 0.1  # 10% of the points in the second cluster

    # Calculate the number of points in each cluster
    N_1 = int(N * proportion_1)
    N_2 = N - N_1

    # Define means and standard deviations for two clusters
    #         X,  Y
    mean_1 = [35, 55]
    std_1 = [10, 20]
    mean_2 = [50, 150]
    std_2 = [20, 30]

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
    df = df[(df['x'] <= 60) ]

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
    return skyline

def find_all_orders_skyline(data, max_order=3):
    # This will store the lists of skyline points for each order
    all_skyline_points = []
    current_data = data[:]  # Create a copy of the list to work on

    for _ in range(1, max_order + 1):
        skyline = find_skyline_points_in_net(current_data)
        if not skyline:  # Break if no skyline points are found
            break
        all_skyline_points.append(skyline)
        # Remove skyline points from current data
        current_data = [point for point in current_data if point not in skyline]

    return all_skyline_points

N = 10
data = generate_data(N)
data = data.to_dict(orient='records')
# print(data)
all_skyline_orders = find_all_orders_skyline(data, max_order=3)
print(len(all_skyline_orders))
# print(find_skyline_points_in_net(data))