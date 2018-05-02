class GridNode
{
	constructor(x, y)
	{
		this.x = x;
		this.y = y;
		this.cost = 1;
		this.blocked = false;
		this.visited = false;
	}
	SetCost(x)
	{
		this.cost = x;
	}
}

class Grid
{
	constructor(gridSize, canvas)
	{

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
	HighlightCurrentSquare(oldNode, newNode)
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
	SetGoal(node)
	{
		this.goal = node;
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
	DrawRobot(nodeX, nodeY)
	{
		var drawStyle = {
			x: nodeX,
			y: nodeY,
			fillStyle: "#d32f2f"
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
	DrawCost(nodeX, nodeY)
	{

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
}

Grid.gridSize = 0;
Grid.blockedProbability = .25;
Grid.blockStyle = {};