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

- Step functionality where it moves one square at a time or time-step mode where it plays a step every x milliseconds.

- Clicking the "Assign Goal" button allows users to change the goal by letting users hover and click on the next location on the grid. Goal is not allowed to be set on current robot's location or on a blocked node.