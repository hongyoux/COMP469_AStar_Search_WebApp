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
		var numX = this.canvas.width() / Grid.gridSize;
		var numY = this.canvas.height() / Grid.gridSize;

		for (var i = 0; i < numY; i++)
		{
			for (var j = 0; j < numX; j++)
			{
				var newGridNode = new GridNode(j, i);
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
		var xIndex = Math.floor(x / Grid.gridSize);
		var yIndex = Math.floor(y / Grid.gridSize);
		return this.GetNode(xIndex, yIndex);
	}
	GetNode(x, y)
	{
		var nodeIndex = y * (this.canvas.height() / Grid.gridSize) + x;
		return this.nodes[nodeIndex];
	}
	GetNodeIndex(node)
	{
		return node.y * (this.canvas.height() / Grid.gridSize) + node.x
	}

	DrawNodes()
	{
		var self = this;
		self.canvas.clearCanvas();
		self.nodes.forEach(function(val, index)
		{
			self.DrawNode(val);
		});
	}
	DrawNode(node)
	{
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
			this.CreateErrorBox();
			$("#boldSummary").text("Missing Goal");
			$("#errorMsg").text("Please click 'Assign Goal' and a square on the grid");
			$("#errorAlert").toggleClass("hide show");
			return;
		}

		this.ResetAStar();

		this.path = this.GeneratePath();

		if (this.path == null)
		{
			//Failed to find a path
			this.CreateErrorBox();
			$("#boldSummary").text("No Path");
			$("#errorMsg").text("Could not Find a Path");
			$("#errorAlert").toggleClass("hide show");
			return;
		}

		var self = this;
		setTimeout(function() {
			self.DrawPathNode();
		}, self.timeout);
	}
	DrawPathNode()
	{
		if (this.path.length > 0)
		{
			this.drawnPath.unshift(this.GetNodeIndex(this.robot));
			this.robot = this.nodes[this.path.pop()];

			if (this.drawnPath.length > 4)
			{
				this.drawnPath.pop();
			}

			this.DrawNodes();
			this.DrawPath();

			var self = this;
			if (this.path.length > 0)
			{
				setTimeout(function() {
					self.DrawPathNode();
				}, self.timeout);
			}
			else
			{
				setTimeout(function() {
					self.FinishTrail();
				}, self.timeout);
			}
		}
	}
	FinishTrail()
	{
		this.drawnPath.pop();
		this.DrawNodes();
		this.DrawPath();

		var self = this;
		if (this.drawnPath.length > 0)
		{
			setTimeout(function() {
				self.FinishTrail();
			}, self.timeout);
		}
	}
	ResetAStar()
	{
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
		var self = this;

		var typedProb = parseFloat($("#spawnProb").val());

		var prob = (isNaN(typedProb)) ? Grid.blockedProbability : typedProb; 

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
		if (oldNode != null)
		{
			this.DrawNode(oldNode);
		}

		if (newNode == this.goal || newNode.blocked)
		{
			// Don't do anything if goal or robot.
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
		this.goal = node;
		this.DrawNodes();
	}
	SetBlocked(node)
	{
		node.blocked = !node.blocked;
		this.DrawNodes();
	}
	SetRobot(node)
	{
		this.robot = node;
		this.DrawNodes();
	}
	SetRandomRobot()
	{
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

		var outStr = '[' + x + ',' + y + "]";
		$("#currRobotText").text(outStr);
	}

	GeneratePath()
	{
		var startIndex = this.GetNodeIndex(this.robot);
		this.gScores.set(startIndex, 0);
		this.fScores.set(startIndex, this.EstimateCost(this.robot, this.goal));
		this.openSet.add(this.robot);

		var self = this;

		while (this.openSet.size > 0)
		{
			var current = self.FindNextNode(self.openSet);
			var currentIndex = self.GetNodeIndex(current);

			if (current == self.goal)
			{
				return self.PathToGoal();
			}

			self.openSet.delete(current);
			self.closedSet.add(current);

			var neighbors = self.GetNeighbors(current);
			neighbors.forEach(function(neighbor, index)
			{
				if (neighbor.blocked == true)
				{
					// Don't evaluate bad nodes
					return;
				}
				if (self.closedSet.has(neighbor))
				{
					return;
				}
				if (!self.openSet.has(neighbor))
				{
					self.openSet.add(neighbor);
				}

				var neighborIndex = self.GetNodeIndex(neighbor);

				var currGScore = (self.gScores.has(neighborIndex)) ? self.gScores.get(neighborIndex) : Infinity;
				var newGScore = self.gScores.get(currentIndex) + self.EstimateCost(current, neighbor);
				if (newGScore >= currGScore)
				{
					return;
				}

				self.cameFrom.set(neighborIndex, currentIndex);
				self.gScores.set(neighborIndex, newGScore);
				self.fScores.set(neighborIndex, self.gScores.get(neighborIndex) + self.EstimateCost(neighbor, self.goal));
			});
		}

		return null;
	}
	PathToGoal()
	{
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
		//Octile distance

		//Moving Up Down Left Right is 1 cost
		//Moving Diagonally is sqrt(2) cost

		//Moving diagonally means removing two straight costs
		//You move diagonally dx or dy times, whichever is smaller.
		var dx = Math.abs(start.x - end.x);
		var dy = Math.abs(start.y - end.y);
		var strCost = 1;
		var diagCost = Math.sqrt(2);
		return strCost * (dx + dy) + (diagCost - 2 * strCost) * Math.min(dx, dy);
	}
	FindNextNode(openSet)
	{
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

Grid.gridSize = 0;
Grid.blockedProbability = .25;
Grid.blockStyle = {};