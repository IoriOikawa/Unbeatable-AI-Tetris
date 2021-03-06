
var i,j;
var rows_completed =0;

//defining x y axis drawing pixel location for each block 10*20
var hasBlock = new Array(20);
for (i = 0; i < 20; i++) {
    hasBlock[i] = new Array(10);
}
//store color map of each block
var blockColor = new Array(20);
for (i = 0; i < 20; i++) {
    blockColor[i] = new Array(10);
}
var blockPositionMap_X = new Array(10);
var blockPositionMap_Y = new Array(20);
var xPosition = 10;
var yPosition = 10;

//******** init the block color and exsistency  ******
for(i=0;i<20;i++)
	for(j=0;j<10;j++)
		hasBlock[i][j] = 0;

for(i=0;i<20;i++)
	for(j=0;j<10;j++)
		blockColor[i][j] = "grey";

for(j=0;j<10;j++){
	blockPositionMap_X[j] = xPosition;
	xPosition+=30;
}
for(i=0;i<20;i++){
	blockPositionMap_Y[i] = yPosition;
	yPosition+=30;
}

function gameSpeed(){

	setInterval(function() {
    	$('.Timer').text((new Date - start) / 1000 + " Seconds");
	}, 1000);
}

function randomPick(){
	//var myArray = ['drawLshape_left', 'drawIshape', 'drawSquare', 'drawLshape_right', 'drawTRIshape', 'drawLIshape_left','drawLIshape_right']; 
	var newShape = PIECES[Math.floor(Math.random() * PIECES.length)];
	//alert(newShape[0].orientation);
	return newShape;
}


function blockUpdate(){
	rows_completed+=checkForCancelRows();
	var shape = randomPick();
	//var decisionLocation = 
	GetDecisionLocation(shape);
	//if it can pick a move to go after evaluation
//	if(gameOver==false){
//		var color = GetColorReference(shape);
//		for(i=0;i<decisionLocation.placeLocation.length;i++){
//			hasBlock[decisionLocation.placeLocation[i][0]][decisionLocation.placeLocation[i][1]] = 1;
//			blockColor[decisionLocation.placeLocation[i][0]][decisionLocation.placeLocation[i][1]] = color;
//		}	
			//rows_completed=getPlacementRow(hasBlock, [[1,0],[1,0],[1,1]], 5);
//	}
//	else
//	{
		//put code here to stop the game
	//	alert("game over");
	//}
	//rows_completed+=checkForCancelRows();
}


function GetDecisionLocation(shape){
	//AI CODE GOES HERE
	var color = GetColorReference(shape);
	var decision = pickDecision(shape);
	//alert("hi");
	if(decision.noMoveCanMake == true)
	{
		gameOver=true;
		aler("game over");
	}
	else
	{ 
		// update the real map with the placed shape
		  for (var i = 0; i < decision.orientation.length; i++) {
	      		for (var j = 0; j < decision.orientation[i].length; j++) {
	      			if(decision.orientation[i][j]==1)
	      			{
	      				hasBlock[decision.row-(decision.orientation.length-1)+i][decision.column+j]=1;
	      				blockColor[decision.row-(decision.orientation.length-1)+i][decision.column+j]=color;
	      			}
	      		}
	       }
	}

	//return {
	//	'placeLocation': [[5,5],[19,0],[19,1],[19,2],[19,3],[19,4],[19,5],[19,6],[19,7],[19,8],[19,9],[17,7],[17,8],[18,3],[18,4],[18,5],[18,6]]
	//};
}

//color of the shape. Get the color when drawing for that shape(!!!Suffer from change depending orientation name)
function GetColorReference(shape){
	switch(shape){
		case PIECES[0]:
		 	return "green";
		 	break;
		case PIECES[1]: 
			return"yellow";
			break;
		case PIECES[2]: 
			return"pink";
			break;
		case PIECES[3]: 
			return"blue";
			break;
		case PIECES[4]: 
			return"purple";
			break;
		case PIECES[5]: 
			return"white";
			break;
		case PIECES[6]: 
			return"brown";
			break;
		default:
			return"green";
			break;
	}
}
function checkForCancelRows(){
	var rows_removed=0;
	for(i=0;i<20;i++)
	{
		var cancel = true;
		var rowCancel =-1;
		for(j=0;j<10;j++)
		{ //checking if this row is full to determine if needs to be cancelled
			if(hasBlock[i][j]==0)
				cancel=false;
			else
				rowCancel=i;			
		}
		if(cancel==true)
		{//if this row needs to be cancelled, shift all blocks above down by 1 block
			rows_removed++;
			for(m=rowCancel;m>0;m--)
				for(n=0;n<10;n++)
				{
					hasBlock[m][n]=hasBlock[m-1][n];
					blockColor[m][n]=blockColor[m-1][n];
				}
		}
	}
	return rows_removed;		
}