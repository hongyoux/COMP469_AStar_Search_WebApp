# COMP469_AStar_Search_WebApp
A* Search demo webapp that has interactivity.

# How to run

1. Download and install [Python3](https://www.python.org/)
2. Extract the contents of this zip file into a directory
3. Run python -m http.server in the directory with files extracted
4. Open a modern web browser to localhost:8000/

# Features

- Change the distribution of blocking nodes by increasing or decreasing the probability in the input field before clicking "Spawn". Invalid values or no value will use the default .25 probability.

- The red square is the robot's current location. The green is the location it is heading to.

- Ability to run the A* search for given pair of robot to endpoint; or to switch on hover mode where the robot will chase the mouse's current location whenever possible.

- Clicking the "Assign Goal" button allows users to change the goal by letting users hover and click on the next location on the grid. Goal is not allowed to be set on current robot's location or on a blocked node.