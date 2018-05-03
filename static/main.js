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
	$('[data-toggle="tooltip"]').tooltip();

    $('#spawnObjs .btn').on('click', function () {
	    // toggle style
	    $(this).siblings().removeClass("btn-secondary active").addClass("btn-outline-secondary");
	    $(this).toggleClass('btn-secondary btn-outline-secondary active');
	    
	    // toggle checkbox
	    var $chk = $(this).siblings().find('[type=checkbox]');
	    $chk.prop('checked', false);

	    var $thisCheckbox = $(this).find('[type=checkbox]')
	    $thisCheckbox.prop('checked', !$thisCheckbox.prop('checked'));
	    
	    return false;
	});

	$('#hoverModeBtn').on('click', function () {
		// toggle style
	    $(this).toggleClass('btn-primary btn-outline-primary active');
		
		var $thisCheckbox = $(this).find('[type=checkbox]')
	    $thisCheckbox.prop('checked', !$thisCheckbox.prop('checked'));
	    
	    return false;
	});
};

function InitCanvasFunctions(grid)
{
    $("#mainCanvas").mousemove(function(event) {
    	var xLoc = event.pageX - $(this).offset().left;
    	var yLoc = event.pageY - $(this).offset().top;

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
	    		grid.HighlightBlock(currentNode, newNode);
	    	}
	    	else if ($("#pickRobot").is(':checked'))
	    	{
	    		grid.HighlightRobot(currentNode, newNode);
	    	}
    		
    		currentNode = newNode;

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
	    	var xLoc = event.pageX - $(this).offset().left;
	    	var yLoc = event.pageY - $(this).offset().top;

	    	var hoveredNode = grid.FromPixelToNode(xLoc, yLoc);
	    	if (hoveredNode != grid.robot && hoveredNode.blocked == false)
	    	{
	    		grid.SetGoal(hoveredNode);
	    	}
	    	$("#pickGoalBtn").click();
		}
    	if ($("#pickBlock").is(':checked'))
    	{
	    	var xLoc = event.pageX - $(this).offset().left;
	    	var yLoc = event.pageY - $(this).offset().top;

	    	var hoveredNode = grid.FromPixelToNode(xLoc, yLoc);
	    	if (hoveredNode != grid.robot && hoveredNode != grid.goal)
	    	{
	    		grid.SetBlocked(hoveredNode);
	    	}
    	}
    	if ($("#pickRobot").is(':checked'))
    	{
	    	var xLoc = event.pageX - $(this).offset().left;
	    	var yLoc = event.pageY - $(this).offset().top;

	    	var hoveredNode = grid.FromPixelToNode(xLoc, yLoc);
	    	if (hoveredNode != grid.goal && hoveredNode.blocked == false)
	    	{
	    		grid.SetRobot(hoveredNode);
	    	}
	    	$("#pickRobotBtn").click();
    	}
    });
};

function InitMenuFunctions(grid)
{
    $("#randomBlockers").click(function(event) {
    	grid.RespawnRandomTerrain();
    });
    $("#runAlgo").click(function(event) {
    	//Debug
    	//console.log("Single step clicked!");
    	if (grid.robot == grid.goal)
    	{
    		grid.goal = null;
    	}
    	grid.DrawAStar();
    });

}