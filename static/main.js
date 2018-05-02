$( document ).ready(function() {
	InitBootstrapPlugins();

    var gridSize = 20; // 16 square with 4 pixel border

    var grid = new Grid(gridSize, $("#mainCanvas"));

    grid.DrawNodes();
    grid.SetRandomRobot();

    currentNode = null;

    $("#mainCanvas").mousemove(function(event) {
    	var xLoc = event.pageX - $(this).offset().left;
    	var yLoc = event.pageY - $(this).offset().top;

    	var newNode = grid.FromPixelToNode(xLoc, yLoc);
    	if (newNode !== currentNode)
    	{
	    	if ($("#pickGoal").is(':checked'))
	    	{
	    		//Highlight light-green
	    		grid.HighlightCurrentSquare(currentNode, newNode);
	    	}
    		currentNode = newNode;

	    	//Debug For Mouse Over
	        console.log("mouse over: " + currentNode.x + ", " + currentNode.y);
    	}
    });

    $("#mainCanvas").click(function(event){
    	var xLoc = event.pageX - $(this).offset().left;
    	var yLoc = event.pageY - $(this).offset().top;

    	var hoveredNode = grid.FromPixelToNode(xLoc, yLoc);
    	if (hoveredNode != grid.robot && hoveredNode.blocked == false)
    	{
    		grid.SetGoal(hoveredNode);
    	}
    	$("#pickGoalBtn").click();
    });

    $("#randomBlockers").click(function(event) {
    	grid.RespawnRandomTerrain();
    });
});

function InitBootstrapPlugins()
{
	$('[data-toggle="tooltip"]').tooltip();

    $('[data-toggle="buttons"] .btn').on('click', function () {
	    // toggle style
	    $(this).toggleClass('btn-secondary btn-primary active');
	    
	    // toggle checkbox
	    var $chk = $(this).find('[type=checkbox]');
	    $chk.prop('checked',!$chk.prop('checked'));
	    
	    return false;
	});
}