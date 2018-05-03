class GridNode
{
	constructor(x, y)
	{
		this.x = x;
		this.y = y;
		this.blocked = false;
		this.visited = false;
	}
}

class Grid
{
	constructor(gridSize, canvas)
	{
		// Canvas Variables
		this.canvas = canvas;
		Grid.gridSize = gridSize;

		Grid.blockStyle = {
			strokeStyle: "#000000",
			strokeWidth: 2,
			width: Grid.gridSize,
			height: Grid.gridSize,
			fromCenter: false,
			cornerRadius: 1
		};
		this.nodes = [];
		this.goal = null;
		this.robot = null;
		this.MakeNodes();

		// A Star Variables
		this.closedSet = new Set();
		this.openSet = new Set();
		this.cameFrom = new Map();
		this.gScores = new Map();
		this.fScores = new Map();
		this.path = [];
		this.drawnPath = [];
		this.timeout = 50;
	}
	MakeNodes()
	{
		// Fill in grid initially with nodes
		var numX = this.canvas.width() / Grid.gridSize;
		var numY = this.canvas.height() / Grid.gridSize;

		for (var i = 0; i < numY; i++)
		{
			for (var j = 0; j < numX; j++)
			{
				var newGridNode = new GridNode(j, i);
				// Default to 25% chance to become blocked terrain on initial load
				var isBlocked = Math.random() < Grid.blockedProbability;
				if (isBlocked)
				{
					newGridNode.blocked = true;
				}

				this.nodes.push(newGridNode);

			}
		}
	}
	CreateErrorBox()
	{
		// Generate a new error box. Bootstrap fade deletes the element instead of hiding so I just make a new box every time.
		var html = '<div id="errorAlert" class="alert alert-danger alert-dismissible fade hide" role="alert"> \
		<strong id="boldSummary"></strong> \
		<span id="errorMsg"></span>\
		<button type="button" class="close" data-dismiss="alert" aria-label="Close">\
		<span aria-hidden="true">&times;</span>\
		</button>\
		</div>';
		$("#errorLoc").append(html);
	}
	FromPixelToNode(x, y)
	{
		// Helper method to convert screen pixels to which grid node
		var xIndex = Math.floor(x / Grid.gridSize);
		var yIndex = Math.floor(y / Grid.gridSize);
		return this.GetNode(xIndex, yIndex);
	}
	GetNode(x, y)
	{
		// Helper method to convert grid x y coordinates to its location in
		// the grid array
		var nodeIndex = y * (this.canvas.height() / Grid.gridSize) + x;
		return this.nodes[nodeIndex];
	}
	GetNodeIndex(node)
	{
		// Helper method to get the index of a node in the grid array
		// Used for A* search as key in maps instead of the node itself
		return node.y * (this.canvas.height() / Grid.gridSize) + node.x
	}

	DrawNodes()
	{
		// Draw every node on the grid
		var self = this;
		self.canvas.clearCanvas();
		self.nodes.forEach(function(val, index)
		{
			self.DrawNode(val);
		});
	}
	DrawNode(node)
	{
		// Depending on grid and node variables, draw a different color per type of node
		var nodeX = node.x * Grid.gridSize;
		var nodeY = node.y * Grid.gridSize;

		if (this.robot != null && node == this.robot)
		{
			this.DrawRobot(nodeX, nodeY);
		}
		else if (this.goal != null && node == this.goal)
		{
			this.DrawGoal(nodeX, nodeY);
		}
		else if (node.blocked === true)
		{
			this.DrawBlocked(nodeX, nodeY);
		}
		else
		{
			this.DrawEmpty(nodeX, nodeY);
		}
	}
	DrawRobot(nodeX, nodeY)
	{
		// Draw a dark red square
		var drawStyle = {
			x: nodeX,
			y: nodeY,
			fillStyle: "#b71c1c"
		}
		drawStyle = Object.assign(Grid.blockStyle, drawStyle);

		this.canvas.drawRect(drawStyle);
	}
	DrawGoal(nodeX, nodeY)
	{
		// Draw a dark green square
		var drawStyle = {
			x: nodeX,
			y: nodeY,
			fillStyle: "#388e3c"
		}
		drawStyle = Object.assign(Grid.blockStyle, drawStyle);

		this.canvas.drawRect(drawStyle);
	}
	DrawBlocked(nodeX, nodeY)
	{
		// Draw a dark grey square
		var drawStyle = {
			x: nodeX,
			y: nodeY,
			fillStyle: "#212121"
		}
		drawStyle = Object.assign(Grid.blockStyle, drawStyle);

		this.canvas.drawRect(drawStyle);
	}
	DrawEmpty(nodeX, nodeY)
	{
		// Draw a white square
		var drawStyle = {
			x: nodeX,
			y: nodeY,
			fillStyle: "#FFFFFF"
		}

		drawStyle = Object.assign(Grid.blockStyle, drawStyle);

		this.canvas.drawRect(drawStyle);
	}
	DrawPath()
	{
		// When animating a* path, leave a trail of up to 4 squares
		// Each slightly lighter red than the previous
		var self = this;
		this.drawnPath.forEach(function(val, index) {
			var node = self.nodes[val];
			var drawStyle = {
				x: node.x * Grid.gridSize,
				y: node.y * Grid.gridSize
			}
			switch(index)
			{
				default:
				case 0:
					drawStyle['fillStyle'] = "#c62828";
					break;
				case 1:
					drawStyle['fillStyle'] = "#d32f2f";
					break;
				case 2:
					drawStyle['fillStyle'] = "#e53935";
					break;
				case 3:
					drawStyle['fillStyle'] = "#f44336";
					break;
			}
			drawStyle = Object.assign(Grid.blockStyle, drawStyle);
			self.canvas.drawRect(drawStyle);
		});
	}
	DrawAStar()
	{
		if (this.goal == null)
		{
			// If there's no goal, throw an error message up.
			this.CreateErrorBox();
			$("#boldSummary").text("Missing Goal");
			$("#errorMsg").text("Please click 'Assign Goal' and a square on the grid");
			$("#errorAlert").toggleClass("hide show");
			return;
		}

		// Reset variables prior to starting a new one
		this.ResetAStar();

		// Get path from the algorithm
		this.path = this.GeneratePath();

		if (this.path == null)
		{
			//Failed to find a path, throw an error.
			this.CreateErrorBox();
			$("#boldSummary").text("No Path");
			$("#errorMsg").text("Could not Find a Path");
			$("#errorAlert").toggleClass("hide show");
			return;
		}

		// Set a timeout to trigger that draws the next step in the animation every 50 ms.
		var self = this;
		setTimeout(function() {
			self.DrawPathNode();
		}, self.timeout);
	}
	DrawPathNode()
	{
		// If there's no path, do not set the robot to null
		// This occurs if you click run before the current run finishes to a new location.
		if (this.path.length > 0)
		{
			// Add the current robot's position to the front of the drawnPath list
			this.drawnPath.unshift(this.GetNodeIndex(this.robot));
			// Set robot to next location in the path to goal
			this.robot = this.nodes[this.path.pop()];

			// Make sure that we remove the last element in the drawnPath list if we hit more than 4 nodes
			if (this.drawnPath.length > 4)
			{
				this.drawnPath.pop();
			}

			// Draw all nodes to clear the path
			this.DrawNodes();
			// Draw path on top of the grid
			this.DrawPath();

			var self = this;
			if (this.path.length > 0)
			{
				// If there are more, keep triggering DrawPathNode()
				setTimeout(function() {
					self.DrawPathNode();
				}, self.timeout);
			}
			else
			{
				// Else, animate the tail end of the trail tapering off
				setTimeout(function() {
					self.FinishTrail();
				}, self.timeout);
			}
		}
	}
	FinishTrail()
	{
		// Remove last node and keep drawing the trail
		this.drawnPath.pop();
		this.DrawNodes();
		this.DrawPath();

		var self = this;
		if (this.drawnPath.length > 0)
		{
			// Draw until there's no more trail left
			setTimeout(function() {
				self.FinishTrail();
			}, self.timeout);
		}
	}
	ResetAStar()
	{
		// Helper method to clear all set variables
		this.closedSet.clear();
		this.openSet.clear();
		this.cameFrom.clear();
		this.gScores.clear();
		this.fScores.clear();
		this.path = [];
		this.drawnPath = [];
	}
	RespawnRandomTerrain()
	{
		// All the self = this is used to maintain scope of the class object in a loop in JS
		var self = this;

		// Read input field for probability
		var typedProb = parseFloat($("#spawnProb").val());

		// If nothing typed or is not a valid float, use the default .25, otherwise use the typed probability
		var prob = (isNaN(typedProb)) ? Grid.blockedProbability : typedProb; 

		// Then iterate over all nodes, check if it should be set to blocked, and redraw the whole grid
		this.nodes.forEach(function(val, index)
		{
			if (val != self.robot || val != self.goal)
			{
				var isBlocked = Math.random() < prob;
				val.blocked = isBlocked;
			}
		});
		this.DrawNodes();
	}
	HighlightGoal(oldNode, newNode)
	{
		// Once hover changes to a new node, redraw the old node as it should be drawn.
		if (oldNode != null)
		{
			this.DrawNode(oldNode);
		}

		if (newNode.blocked || newNode == this.robot)
		{
			// Don't do anything if blocked or robot.
			return;
		}

		var drawStyle = {
			x: newNode.x * Grid.gridSize,
			y: newNode.y * Grid.gridSize,
			fillStyle: "#c8e6c9"
		}
		drawStyle = Object.assign(Grid.blockStyle, drawStyle);

		this.canvas.drawRect(drawStyle);
	}
	HighlightBlock(oldNode, newNode)
	{
		// Once hover changes to a new node, redraw the old node as it should be drawn.
		if (oldNode != null)
		{
			this.DrawNode(oldNode);
		}

		if (newNode == this.goal || newNode == this.robot)
		{
			// Don't do anything if goal or robot.
			return;
		}

		var drawStyle = {
			x: newNode.x * Grid.gridSize,
			y: newNode.y * Grid.gridSize,
			fillStyle: "#6c757d"
		}
		drawStyle = Object.assign(Grid.blockStyle, drawStyle);

		this.canvas.drawRect(drawStyle);
	}
	HighlightRobot(oldNode, newNode)
	{
		// Once hover changes to a new node, redraw the old node as it should be drawn.
		if (oldNode != null)
		{
			this.DrawNode(oldNode);
		}

		if (newNode == this.goal || newNode.blocked)
		{
			// Don't do anything if goal or blocked.
			return;
		}

		var drawStyle = {
			x: newNode.x * Grid.gridSize,
			y: newNode.y * Grid.gridSize,
			fillStyle: "#e83e8c"
		}
		drawStyle = Object.assign(Grid.blockStyle, drawStyle);

		this.canvas.drawRect(drawStyle);
	}
	SetGoal(node)
	{
		// Sets the goal then triggers a redraw.
		this.goal = node;
		this.DrawNodes();
	}
	SetBlocked(node)
	{
		// Sets the node to blocked and then triggers a redraw
		node.blocked = !node.blocked;
		this.DrawNodes();
	}
	SetRobot(node)
	{
		// Sets the robot to a new node and then triggers redraw
		this.robot = node;
		this.DrawNodes();
	}
	SetRandomRobot()
	{
		// Used initially to give the robot a position on the grid
		// If it randomly selects a blocked location, rerun the random until
		// a valid spot is found. then set it.
		var self = this;
		var x = Math.floor(Math.random() * (this.canvas.width() / Grid.gridSize));
		var y = Math.floor(Math.random() * (this.canvas.height() / Grid.gridSize));

		while (self.GetNode(x, y).blocked === true)
		{
			x = Math.floor(Math.random() * (self.canvas.width() / Grid.gridSize));
			y = Math.floor(Math.random() * (self.canvas.height() / Grid.gridSize));
		}

		this.robot = this.GetNode(x, y);
		this.DrawNodes();
	}

	GeneratePath()
	{
		// Set the start to the current robot location and set gscore to 0 and fscore to estimate
		var startIndex = this.GetNodeIndex(this.robot);
		this.gScores.set(startIndex, 0);
		this.fScores.set(startIndex, this.EstimateCost(this.robot, this.goal));
		this.openSet.add(this.robot);

		var self = this;

		while (this.openSet.size > 0)
		{
			// Find the next lowest f score node and expand on it
			var current = self.FindNextNode(self.openSet);
			var currentIndex = self.GetNodeIndex(current);

			if (current == self.goal)
			{
				// If the node is the goal, then we're done
				return self.PathToGoal();
			}

			self.openSet.delete(current);
			self.closedSet.add(current);

			// Get the neighbors for the current node
			var neighbors = self.GetNeighbors(current);
			neighbors.forEach(function(neighbor, index)
			{
				if (neighbor.blocked == true)
				{
					// Don't evaluate blocked nodes
					return;
				}
				if (self.closedSet.has(neighbor))
				{
					// Already expanded this node, don't proceed
					return;
				}
				if (!self.openSet.has(neighbor))
				{
					// Only add neighbors if they don't already exist in the set
					self.openSet.add(neighbor);
				}

				var neighborIndex = self.GetNodeIndex(neighbor);

				// if current estimate for g doesn't exist, set it to infinity
				var currGScore = (self.gScores.has(neighborIndex)) ? self.gScores.get(neighborIndex) : Infinity;
				// find the new g score from the previous node + cost to move from previous node to here
				var newGScore = self.gScores.get(currentIndex) + self.EstimateCost(current, neighbor);
				if (newGScore >= currGScore)
				{
					// If the new g is worse than current one, go to next neighbor
					return;
				}

				// Otherwise update the cameFrom to set parent node
				// and set stored g value to new g and update the f score by setting equal to g + estimate from this node to the goal
				self.cameFrom.set(neighborIndex, currentIndex);
				self.gScores.set(neighborIndex, newGScore);
				self.fScores.set(neighborIndex, self.gScores.get(neighborIndex) + self.EstimateCost(neighbor, self.goal));
			});
		}

		return null;
	}
	PathToGoal()
	{
		// Starting from the goal, walk backwards in the "cameFrom" map until the robot is found
		// That is the path from start to finish of the A* algorithm
		var self = this;
		var path = [];
		var currNodeIndex = this.GetNodeIndex(this.goal);
		var robotIndex = this.GetNodeIndex(this.robot);

		while (currNodeIndex != robotIndex)
		{
			path.push(currNodeIndex);
			currNodeIndex = self.cameFrom.get(currNodeIndex);
		}
		console.log("DONE");
		return path;
	}
	EstimateCost(start, end)
	{
		// Octile distance

		// Moving Up Down Left Right is 1 cost
		// Moving Diagonally is sqrt(2) cost

		// Moving diagonally means removing two straight costs
		// You move diagonally dx or dy times, whichever is smaller.

		// Used both to estimate the distance and calculate the current g value of the path
		var dx = Math.abs(start.x - end.x);
		var dy = Math.abs(start.y - end.y);
		var strCost = 1;
		var diagCost = Math.sqrt(2);
		return strCost * (dx + dy) + (diagCost - 2 * strCost) * Math.min(dx, dy);
	}
	FindNextNode(openSet)
	{
		// Helper method to find the lowest f score amongst open set candidates

		var self = this;
		var nextNode = null;
		var nextNodeFValue = Infinity;
		openSet.forEach(function(val, sameVal, openSet)
		{
			var valIndex = self.GetNodeIndex(val);
			var valFScore = self.fScores.get(valIndex);
			if (valFScore < nextNodeFValue)
			{
				nextNode = val;
				nextNodeFValue = valFScore;
			}
		});
		return nextNode;
	}
	GetNeighbors(node)
	{
		// Helper method to get all neighbors around a grid node
		// Discards any values that are outside the border of the grid

		var list = [];
		for (var i = -1; i < 2; i++)
		{
			for (var j = -1; j < 2; j++)
			{
				if (i == 0 && j == 0)
				{
					//Ignore self.
					continue;
				}

				var newX = node.x + i;
				var newY = node.y + j;

				if (newX < 0 || newX >= this.canvas.width() / Grid.gridSize ||
					newY < 0 || newY >= this.canvas.height() / Grid.gridSize)
				{
					//Invalid index
					continue;
				}

				list.push(this.GetNode(newX, newY));
			}
		}
		return list;
	}
}

// Some static variables that are used often
Grid.gridSize = 0;
Grid.blockedProbability = .25;
Grid.blockStyle = {};