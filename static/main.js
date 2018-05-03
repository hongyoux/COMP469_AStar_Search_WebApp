$( document ).ready(function() {
	InitBootstrapFunctions();

    var gridSize = 20; // 16 square with 4 pixel border

    var grid = new Grid(gridSize, $("#mainCanvas"));

    grid.DrawNodes();
    grid.SetRandomRobot();

    currentNode = null;

    InitCanvasFunctions(grid);
    InitMenuFunctions(grid);
});

function InitBootstrapFunctions()
{
	// Enable tooltips on button hover
	$('[data-toggle="tooltip"]').tooltip();

	// Toggle all other buttons off in the button group and only
	// toggle on or off the current button you are clicking
    $('#spawnObjs .btn').on('click', function () {
	    // toggle button style
	    $(this).siblings().removeClass("btn-secondary active").addClass("btn-outline-secondary");
	    $(this).toggleClass('btn-secondary btn-outline-secondary active');
	    
	    // toggle hidden checkbox
	    var $chk = $(this).siblings().find('[type=checkbox]');
	    $chk.prop('checked', false);

	    var $thisCheckbox = $(this).find('[type=checkbox]')
	    $thisCheckbox.prop('checked', !$thisCheckbox.prop('checked'));
	    
	    // Don't propagate the click
	    return false;
	});

    // Slightly different css toggles for the hover mode button
	$('#hoverModeBtn').on('click', function () {
		// toggle style
	    $(this).toggleClass('btn-primary btn-outline-primary active');
		
		var $thisCheckbox = $(this).find('[type=checkbox]')
	    $thisCheckbox.prop('checked', !$thisCheckbox.prop('checked'));
	    
	    // Don't propagate the click
	    return false;
	});
};

function InitCanvasFunctions(grid)
{
    $("#mainCanvas").mousemove(function(event) {
    	var xLoc = event.pageX - $(this).offset().left;
    	var yLoc = event.pageY - $(this).offset().top;

    	// In order not to spam the highlight draw calls, only draws if
    	// hover changes to another grid square
    	var newNode = grid.FromPixelToNode(xLoc, yLoc);
    	if (newNode !== currentNode)
    	{
	    	if ($("#pickGoal").is(':checked'))
	    	{
	    		//Highlight light-green
	    		grid.HighlightGoal(currentNode, newNode);
	    	}
	    	else if ($("#pickBlock").is(':checked'))
	    	{
	    		//Highlight grey 
	    		grid.HighlightBlock(currentNode, newNode);
	    	}
	    	else if ($("#pickRobot").is(':checked'))
	    	{
	    		//Highlight pink
	    		grid.HighlightRobot(currentNode, newNode);
	    	}
    		
    		currentNode = newNode;

    		// If hover mode is on, call the a star run method every time the node changes and
    		// it is a valid placement for the goal (not in a blocked square and not on the robot)
    		if ($('#hoverMode').is(':checked') && !currentNode.blocked && !(currentNode == grid.robot))
    		{
    			grid.SetGoal(currentNode);
    			grid.DrawAStar();
    		}
    	}
    });

    $("#mainCanvas").click(function(event){
    	if ($("#pickGoal").is(':checked'))
    	{
    		// Offset necessary to place coordinates over the canvas
	    	var xLoc = event.pageX - $(this).offset().left;
	    	var yLoc = event.pageY - $(this).offset().top;

	    	var hoveredNode = grid.FromPixelToNode(xLoc, yLoc);
	    	if (hoveredNode != grid.robot && hoveredNode.blocked == false)
	    	{
	    		// Set the goal if valid placement
	    		grid.SetGoal(hoveredNode);
	    	}
	    	// Toggle off the assign goal button
	    	$("#pickGoalBtn").click();
		}
    	if ($("#pickBlock").is(':checked'))
    	{
    		// Offset necessary to place coordinates over the canvas
	    	var xLoc = event.pageX - $(this).offset().left;
	    	var yLoc = event.pageY - $(this).offset().top;

	    	var hoveredNode = grid.FromPixelToNode(xLoc, yLoc);
	    	if (hoveredNode != grid.robot && hoveredNode != grid.goal)
	    	{
	    		// Toggle blocked terrain on square if not goal or not robot
	    		grid.SetBlocked(hoveredNode);
	    	}
    	}
    	if ($("#pickRobot").is(':checked'))
    	{
    		// Offset necessary to place coordinates over the canvas
	    	var xLoc = event.pageX - $(this).offset().left;
	    	var yLoc = event.pageY - $(this).offset().top;

	    	var hoveredNode = grid.FromPixelToNode(xLoc, yLoc);
	    	if (hoveredNode != grid.goal && hoveredNode.blocked == false)
	    	{
	    		// Set the robot if valid placement
	    		grid.SetRobot(hoveredNode);
	    	}
	    	// Toggle off the assign robot button
	    	$("#pickRobotBtn").click();
    	}
    });
};

function InitMenuFunctions(grid)
{
	// Button to generate random terrain
    $("#randomBlockers").click(function(event) {
    	grid.RespawnRandomTerrain();
    });
    // Button to start running a* algorithm
    $("#runAlgo").click(function(event) {
    	// If the robot is on top of the goal,
    	// set goal to null to display proper error message
    	if (grid.robot == grid.goal)
    	{
    		grid.goal = null;
    	}
    	grid.DrawAStar();
    });
};