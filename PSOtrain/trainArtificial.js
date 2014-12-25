
var rows_completed;
var gameOver;
//defining x y axis drawing pixel location for each block 10*20
var hasBlock = new Array(20);
for (var i = 0; i < 20; i++) {
    hasBlock[i] = new Array(10);
}
//store color map of each block
var blockColor = new Array(20);
for (var i = 0; i < 20; i++) {
    blockColor[i] = new Array(10);
}
var blockPositionMap_X = new Array(10);
var blockPositionMap_Y = new Array(20);
var xPosition;
var yPosition;

var weights0;
var weights1;
var weights2;
var weights3;
var weights4;
var weights5;


function randomPick(){
	//var myArray = ['drawLshape_left', 'drawIshape', 'drawSquare', 'drawLshape_right', 'drawTRIshape', 'drawLIshape_left','drawLIshape_right']; 
	var newShape = PIECES[Math.floor(Math.random() * PIECES.length)];
	//alert(newShape[0].orientation);
	return newShape;
}


function blockUpdate(){
	rows_completed+=checkForCancelRows();
	var shape = randomPick();

	GetDecisionLocation(shape);

}


function GetDecisionLocation(shape){
	//AI CODE GOES HERE
	var color = GetColorReference(shape);
	var decision = pickDecision(shape);
	//alert("hi");
	if(decision.noMoveCanMake == true)
	{
		gameOver=true;
	}
	else
	{ 
		// update the real map with the placed shape
		  for (var i = 0; i < decision.orientation.length; i++) {
	      		for (var j = 0; j < decision.orientation[i].length; j++) {
	      			if(decision.orientation[i][j]==1)
	      			{
	      				hasBlock[decision.row-(decision.orientation.length-1)+i][decision.column+j]=1;
	      				//blockColor[decision.row-(decision.orientation.length-1)+i][decision.column+j]=color;
	      			}
	      		}
	       }
	}
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
	for(var i=0;i<20;i++)
	{
		var cancel = true;
		var rowCancel =-1;
		for(var j=0;j<10;j++)
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

// this is for the computer to make decision based on the feature evaluation function

function evaluateDecision(testResult,orientation) {

	  return GetLandingHeight(testResult, orientation) * weights0 +
	      testResult.rows_removed * weights1 +
	      GetRowTransitions(testResult.map_temp) * weights2+
	      GetColumnTransitions(testResult.map_temp) * weights3 +
	      GetNumberOfHoles(testResult.map_temp) * weights4 +
	      GetWellSums(testResult.map_temp) * weights5;
}

//this func is to pick the best move by trying all moves and evaluating them:
function pickDecision(piece){
	var decisionScore_best = -100000;
	var decisionScore = undefined;
  	var orientation_best = 0;
  	var column_best = 0;
  	var row=0;

  	// Evaluate all possible orientations of this shape
  	for (var i in piece) {
  		//get one orientation of the shape
    	var orientation = piece[i].orientation;

	 	// Evaluate all possible columns: shift this orientation from left2right
	    for (var j = 0; j < 10 - piece[i].width + 1; j++) {

	    	//make a copy of the map for manipulation and test/evaluation
			var blockMap_temp = new Array(20);
			for (var m = 0; m < 20; m++) {
			    blockMap_temp[m] = new Array(10);
			}
			for(var a=0;a<20;a++)
				for(var b=0;b<10;b++)
					blockMap_temp[a][b] = hasBlock[a][b];

			//test this colum and return result
		    var testResult = testThisColumn(orientation, j, blockMap_temp);
		    // evaluate this column placement
		    if (testResult.This_is_gameOverColumn==false) {
		        	decisionScore = evaluateDecision(testResult,orientation);

			        if (decisionScore > decisionScore_best) {
				          decisionScore_best = decisionScore;
				          orientation_best = i;
				          column_best = j;
				          row=testResult.landing_height;
			        }
	      	}
	    }
	  }
	  	//alert(decisionScore);
	  if(decisionScore==undefined)
	  	return { 'noMoveCanMake' : true };
	//return the best decision or no move 
    return {
	    'orientation': piece[orientation_best].orientation,
	    'column': column_best,
	    'row':row,
	    'noMoveCanMake': false
  	};
}

function testThisColumn(orientation, column, blockMap_temp){

	  var placementRow = getPlacementRow(blockMap_temp, orientation, column);

	  if (placementRow - orientation.length < 0) {
	    return { 'This_is_gameOverColumn' : true };
	  }

	  	  // update the map with the placed shape
	  for (var i = 0; i < orientation.length; i++) {
      		for (var j = 0; j < orientation[i].length; j++) {
      			if(orientation[i][j]==1)
      				blockMap_temp[placementRow-(orientation.length-1)+i][column+j]=1;
      		}
       }

	  // calculate how many rows can be cancelled out
	  var rowsRemoved=0;
	  for(var i=0;i<20;i++)
	  {
			var cancel = true;
			for(var j=0;j<10;j++)
			{ //checking if this row is full to determine if needs to be cancelled
				if(blockMap_temp[i][j]==false)
					cancel=false;			
			}	
			if(cancel==true)
				rowsRemoved++;			
	  }
	  return { //return test result of this column
	    'landing_height' : placementRow,
	    'map_temp' : blockMap_temp,
	    'rows_removed' : rowsRemoved,
	    'This_is_gameOverColumn' : false
	  };
}

function getPlacementRow(blockMap_temp, orientation, column){
	//if(orientation.length-1)
		//should fix a bug : block start from the middle where overlaps the exsistent block.
  for (var row = orientation.length-1; row < 20; row++) {
	    // test each row moving from top to bottom. if found conflict return row above
	    for (var i = 0; i < orientation.length; i++) {
	    	for (var j = 0; j < orientation[i].length; j++) {
	    		if(orientation[i][j] * blockMap_temp[row-(orientation.length-1)+i][column+j] == 1)
	    			return row-1;
    		}
		}
	}
	return 19;
}

function GetLandingHeight(testResult, orientation) {
  var height = (19-testResult.landing_height) + ((orientation.length - 1) / 2);
  return height;
}

function GetRowTransitions(map_temp)
{		//10111010
	  var transitions = 0;

	  for (var i = 0; i < map_temp.length; i++) {
	  		//each row from here:
		    for (var j = 0; j < 9; j++) {
			    	if(map_temp[i][j]!= map_temp[i][j+1])
			    		transitions++;
	  		}
	  	}
	  return transitions;
}

function GetColumnTransitions(map_temp)
{
	  var transitions = 0;
	  for (var j = 0; j < 10; j++)
	  { //each column from here:
		  	for (var i = 0; i < map_temp.length-1; i++) 
			{
				if(map_temp[i][j]!= map_temp[i+1][j])
		    		transitions++;
		 	}
	  }
	  return transitions;
}

function GetNumberOfHoles(map_temp) 
{
	  var holes = 0;
	  for (var j = 0; j < 10; j++)
	  { //each column from here:
		  	for (var i = 0; i < 20; i++) 
			{
				if(map_temp[i][j]== 1)
				{ //if this is a 1 then find all 0 below it till there is a 1 or the bottom is reached
					for (var m = i+1; m< 20; m++) 
					{
						if(map_temp[m][j]==0)
							holes++;
						else
							break;
					}
		    	}	
		 	}
	  }
	  return holes;
}

function GetWellSums(map_temp)
{
	  var well_sums = 0;
	  for (var i = 0; i < 10; i++) {
    		for (var j =0; j < 20; j++) {
    			if(i==0)
    			{
    				if(map_temp[j][i]==0 && map_temp[j][i+1] ==1)
    				{
    					for(var m=j; m<20; m++){
	    					if(map_temp[m][i]==0)
	    						well_sums++;
	    					else
	    						break;
	    				}
    				}
    			}
    			if(i==9)
    			{
    				if(map_temp[j][i]==0 && map_temp[j][i-1] ==1)
    				{
	    				for(var m=j; m<20; m++){
	    					if(map_temp[m][i]==0)
	    						well_sums++;
	    					else
	    						break;
	    				}
    				}
    			}
    			else
    			{
    				if(map_temp[j][i]==0 && map_temp[j][i-1] ==1 && map_temp[j][i+1]==1)
    				{
	    				for(var m=j; m<20; m++){
	    					if(map_temp[m][i]==0)
	    						well_sums++;
	    					else
	    						break;
	    				}
    				}

    			}	
    			
    		}
	   }
	   return well_sums;
}



var PIECES = new Array();

/* 'I' piece:
  Orientations:
  X
  X       XXXXX
  X
  X
  */
PIECES[0] = [
    {
      orientation: [1, 1, 1, 1],
      width: 1,
      height: 4
    },
    {
      orientation: [[1,1,1,1]],
      width: 4,
      height: 1
    }
];

/**
 * 'T' piece
 * Orientations:
 *
 *  O     O      O    OOO
 * OOO    OO    OO     O
 *        O      O
 */
PIECES[1] = [
    {
      orientation: [
          [1,0],
          [1,1],
          [1,0]
      ],
      width: 2,
      height: 3,
    }, 
    {
      orientation: [
          [0,1,0],
          [1,1,1]
      ],
      width: 3,
      height: 2,
    },
    {
      orientation: [
          [0,1],
          [1,1],
          [0,1]
      ],
      width: 2,
      height: 3,
    },
    {
      orientation: [
          [1,1,1],
          [0,1,0]
      ],
      width: 3,
      height: 2,
    },
];

/**
 * 'O' piece
 * Orientations:
 *
 * OO
 * OO
 */
PIECES[2] = [
    {
      orientation: [
          [1,1],
          [1,1]
      ],
      width: 2,
      height: 2,
    },
];

/**
 * 'J' piece
 * Orientations:
 *
 * O      OO    OOO    O
 * OOO    O       O    O
 *        O           OO
 */
PIECES[3] = [
    {
      orientation: [
          [1,0,0],
          [1,1,1]
      ],
      width: 3,
      height: 2,
    },
    {
      orientation: [
          [0,1],
          [0,1],
          [1,1]
      ],
      width: 2,
      height: 3,
    },
    {
      orientation: [
          [1,1,1],
          [0,0,1],
      ],
      width: 3,
      height: 2,
    },
    {
      orientation: [
          [1,1],
          [1,0],
          [1,0]
      ],
      width: 2,
      height: 3,
    },
];

/**
 * 'L' piece
 * Orientations:
 *
 *   O    OO    OOO    O
 * OOO     O    O      O
 *         O           OO
 */
PIECES[4] = [
    {
      orientation: [
          [1,1,1],
          [1,0,0],
      ],
      width: 3,
      height: 2,
    },
    {
      orientation: [
          [1,0],
          [1,0],
          [1,1]
      ],
      width: 2,
      height: 3,
    },
    {
      orientation: [
          [0,0,1],
          [1,1,1]
      ],
      width: 3,
      height: 2,
    },
    {
      orientation: [
          [1,1],
          [0,1],
          [0,1]
      ],
      width: 2,
      height: 3,
    },
    
];


/**
 * 'S' piece
 * Orientations:
 *
 *  OO    O
 * OO     OO
 *         O
 */
PIECES[5] = [
    {
      orientation: [
          [1,0],
          [1,1],
          [0,1]
      ],
      width: 2,
      height: 3,
    },
    {
      orientation: [
          [0,1,1],
          [1,1,0]
      ],
      width: 3,
      height: 2,
    },
];

/**
 * 'Z' piece
 * Orientations:
 *
 * OO      O
 *  OO    OO
 *        O
 */
PIECES[6] = [
    {
      orientation: [
          [0,1],
          [1,1],
          [1,0]
      ],
      width: 2,
      height: 3,
    },
    {
      orientation: [
          [1,1,0],
          [0,1,1]
      ],
      width: 3,
      height: 2,
    },
];

function play(){
	resetVar();
	while(true)
	{
		blockUpdate();
		if (gameOver==true)
			break;

	}

	debug("rows removed: "+rows_completed+" for weights: "+weights0+", "+weights1+", "+weights2+", "+weights3+", "+weights4+", "+weights5);

}

///////////////////////////////////////////////////////////////////////////////////////////

var MAXBOUND = 100; // Max value of Weights to test
var MINBOUND = -100; // Min value of weight
var RANGE = MAXBOUND - MINBOUND; 
var VELOCITYINIT = RANGE; // Max initial velocity of particles
var FEATURECOUNT = 6; // Number of features to assign weights to, correspond to dimension of space to search
var SWARMSIZE = 63; // Number of swarm particles
var ITERATION = 100; // Number of iteration to loop 
var FILENAME = "particle.txt";
var gBestWeight= new Array(FEATURECOUNT);
var gBest=0;
var particles;
var V_PARAM1 = 0.6571;
var V_PARAM2 = 1.6319; 
var V_PARAM3 = 0.6239; 
for(var i=0;i<FEATURECOUNT;i++){
	this.gBestWeight[i]=0.0;
}	


initSwarm(); // Initial particles randomly in the space

				for (var iter = 0; iter <ITERATION; iter++)
                {
                        for (var f = 0; f < particles.length; f++) // Check through every particle at each iteration
                        {
                                var score  = evaluate(f); // Evaluate the current weights of the particle 
                                updateScore(score,f);
                                if (score > gBest) // Update the Swarm's best score and weights
                                {
                                        gBest =score;
                                        gBestWeight = new Array(FEATURECOUNT);
                                        gBestWeight = particles[f].weight.slice(0);
                                                                        
                                }
                                // Upate the particle position and velocity
                                updateVelocity(gBestWeight, VELOCITYINIT, f);
                                updatePosition(MAXBOUND, MINBOUND, f);
                        }
                        debug(" ");
                        debug(" *********************************************************************************************************************");
                        debug(" ");
                        debug(" Best Score in iter " +iter + ": " + gBest+" with --> "+gBestWeight);
                        debug(" ");
                        debug(" *********************************************************************************************************************");
                        debug(" ");
                        debug(" ");
                }
                debug("Best Score" + " " + gBest+ " ");
                for (var k = 0; k< gBestWeight.length; k++)
                        debug(gBestWeight[k] + " ");


function resetVar(){

	//******** init the block color and exsistency  ******
		rows_completed=0;
		gameOver=false;
		xPosition = 10;
		yPosition = 10;

		for(var i=0;i<20;i++)
			for(var j=0;j<10;j++)
				hasBlock[i][j] = 0;

		for(var j=0;j<10;j++){
			blockPositionMap_X[j] = xPosition;
			xPosition+=30;
		}
		for(var i=0;i<20;i++){
			blockPositionMap_Y[i] = yPosition;
			yPosition+=30;
		}
		
}

        // Initialise swarm by randomising every particle 
        function initSwarm() {
                particles = new Array(SWARMSIZE);
                for (var i = 0; i < SWARMSIZE; i++)
                {
                        particles[i] =  new particleObj (generateRandomW(),generateRandomV());
                        //debug(particles[i].weight);
                }
        }

                // Generates random initial velocity for a particle
        function generateRandomV() {
                var v = new Array(FEATURECOUNT);
                for (var i = 0; i < v.length; i++)
                {		
                	var rand=Math.random()
                    v[i] =  rand*VELOCITYINIT;
                    if (rand < 0.5)
                           v[i] *= -1; // Equal change to move in either direction
                }
                return v;
        }

        // Generates an array with random values for initial location (weight) of particle
        function generateRandomW() {
                var w = new Array(FEATURECOUNT);
                for (var i = 0; i < w.length; i++)
                {
                    w[i] =  Math.random()*RANGE+ MINBOUND;
                }
                return w;
        }
        

        function evaluate(index){
        	weights0=particles[index].weight[0];
    			weights1=particles[index].weight[1];
    			weights2=particles[index].weight[2];
    			weights3=particles[index].weight[3];
    			weights4=particles[index].weight[4];
    			weights5=particles[index].weight[5];
        	play();
        	return rows_completed;

        }

         
		function particleObj (w,v){ 
		        this.weight = w;
		        this.velocity  = v;
    			 	this.pBest =0;
    			 	this.pBestWeight = new Array(w.length);
			 			for(var i=0;i<w.length;i++){
			 				this.pBestWeight[i]=0.0;
						}	
		}


		function updateVelocity(gBestWeight,bound, index){


                for (var i = 0; i < particles[index].velocity.length; i++)
                {		//var rand = Math.random();
                        particles[index].velocity[i] = V_PARAM1*particles[index].velocity[i] + V_PARAM2*(particles[index].pBestWeight[i]-particles[index].weight[i])*Math.random() + V_PARAM3*(gBestWeight[i]-particles[index].weight[i])*Math.random();
                                                //debug(particles[index].velocity[i]);
                        if (particles[index].velocity[i] > bound) // Bound velocity so it does not speed up infinitely
                                particles[index].velocity[i] = bound;
                        else if (particles[index].velocity[i] < -bound)
                                particles[index].velocity[i] = -bound;
                }
		}

		function updatePosition(maxBound, minBound, index){
                for (var i=0; i< particles[index].velocity.length; i++)
                {
                        particles[index].weight[i] += particles[index].velocity[i];

                        if (particles[index].weight[i] > maxBound) // Bounds range of weights so it stays within the swarm space
                                particles[index].weight[i] = maxBound;
                        else if (particles[index].weight[i] < minBound)
                                particles[index].weight[i] = minBound;
                            //debug(particles[index].weight[i]);
                }
		}

		function updateScore(score, index){
                if (score > particles[index].pBest) // Update to best score so far
                {
                        particles[index].pBest = score;
                        particles[index].pBestWeight = new Array(FEATURECOUNT);
                        particles[index].pBestWeight = particles[index].weight.slice(0);
                }

		}