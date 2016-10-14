
"use strict";

//The purpose of this is to start the process of trying to draw a heart
//
// Here is one pretty good looking formula for a heart
// x(t) = 16 sin^3 (t)
// y(t) = 13 cos(t) - 5 cos(2t) - 2 cos(3t) - cos(4t)
// saw it here: http://mathworld.wolfram.com/HeartCurve.html
//
// But this idea might work better (http://www.mathematische-basteleien.de/heart.htm):
// In the simplest case, a heart is formed by a square standing on 
//		its point and two semi-circles sitting on the sides
// It looks really nice, too
//


//I want o

var HeartYou = function(config) {

	var heart_url = "images/2764.png";

	var me = {};
	var that = this;

	//me.tweetCounts = [] //order, [{id, other info}]

	var returnedThing = {};

	me.svgElementContainerID = config.svgElementID;
	me.svgElementContainer$ = $("#" + me.svgElementContainerID);
	me.svgElementContainerD3 = d3.select("#" + me.svgElementContainerID);

	var margin = {left:20, top:20, right:20,bottom:20};

	var width = me.svgElementContainer$.width() - margin.left - margin.right,
	    height = me.svgElementContainer$.height() - margin.top - margin.bottom;


	me.theSvg = me.svgElementContainerD3.append("svg")
								    .attr("width", width + margin.left + margin.right)
								    .attr("height", height + margin.top + margin.bottom)
								  .append("g")
								    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


function radiansToDegrees(radians) {
	return 180 * radians/Math.PI;
}

function normalize(u) {
	var dist = u.x*u.x + u.y*u.y;
	if (dist>0) {
			dist = Math.sqrt(dist);
			return {x: u.x/dist, y: u.y/dist};
	}
	else {
		return {x:0, y:0};
	}
}
	//define the base points for the curve
	//	right circle - centered at ... in terms of heart config
	// the main config is the length of the sides of the square
// right side

var squareSize = width/5;
var numberPointsCircle = 100;
var pi = Math.PI;
var pi_over_2 = pi/2;
var pi_over_4 = pi/4;
var radius = squareSize/2;

//length to first turning (starts out vertical)
//45 degrees
var lengthToFirstTurn = pi*radius/4;
var lengthToSquarePart = pi * radius; //at this point, we are along the side of the square

//things are vertical until here, at which point they start turning

var indexInListOfPointsWhereAngleChanges = numberPointsCircle/4;


var xScale = d3.scale.linear()
											.domain([-squareSize/2, squareSize/2])
											.range([0, squareSize]);

var yScale = d3.scale.linear()
											.domain([-squareSize/2, squareSize/2])
											.range([squareSize, 0]);

var dRightHump = d3.range(0,numberPointsCircle,1).map (function(i) {

	//center at (squareSize/2,0), radius = squareSize, go from pi/2 to -pi/2
	var angle_radians = pi_over_2 + (i/numberPointsCircle) * (-pi);
	return {x: (squareSize/2) + radius * Math.cos(angle_radians),
						y: radius * Math.sin(angle_radians)};

});
// var dRightSide = [];
// dRightSide.push({x: squareSize/2, y: squareSize/2});
//we just need to add the point to get it to the bottom
 dRightHump.push({x: -squareSize/2, y:-squareSize/2});

//left side treated as separate thing, since we traverse it differently
var dLeftHump = d3.range(0,numberPointsCircle,1).map (function(i) {

	//center at (squareSize/2,0), radius = squareSize, go from pi/2 to -pi/2
	var angle_radians = 0 + (i/numberPointsCircle) * (pi);
	return {x: radius * Math.cos(angle_radians),
						y: (squareSize/2) + radius * Math.sin(angle_radians)};

});
// var dLeftSide = [];
// dLeftSide.push({x: -squareSize/2, y:squareSize/2});
dLeftHump.push({x: -squareSize/2, y: -squareSize/2});

//we join the pieces of the left and right side separately

//line to actually draw
//	right hump, left hump reversed, join it

var dataForThingToDraw = dRightHump.slice(0);

dataForThingToDraw = dataForThingToDraw.concat(dLeftHump.slice(0).reverse());
dataForThingToDraw.push(dRightHump[0]); //last=first point
dataForThingToDraw.push(dRightHump[1]); //last=first point

var lineFunction = d3.svg.line()
                         .x(function(d) { return xScale(d.x); })
                         .y(function(d) { return yScale(d.y); })
                         .interpolate("linear");								    


//																						"translate(" + width/2 + " " + height/2 + ")" +

var heartContainerSvg = 	me.theSvg.append("g")
																			.attr("transform", 
																						"translate(" + width/2 + " " + height/2 + ")" +
																						"rotate(-45)");

var heartRightSvgPath = heartContainerSvg.append("path")
														.attr("d", lineFunction(dRightHump))
														.classed("heartline", true);

var heartLeftSvgPath = heartContainerSvg.append("path")
														.attr("d", lineFunction(dLeftHump))
														.classed("heartline", true)
														.classed("left", true);

var heartLineDrawnPath = heartContainerSvg.append("path")
														.attr("d", lineFunction(dataForThingToDraw))
														.classed("heartline-drawn", true);



//let's see about first just rendering the points on the right hump



 var desiredGap = 15;
 var lengthRightHump = heartRightSvgPath.node().getTotalLength();

 var numberThings = Math.floor(lengthRightHump/desiredGap);
 me.numberThingsOnASide = numberThings;
 var locationsForStackSvg = [];

	var thingsForEachI = [];
	var thingsForEachILeft = [];


 for (var i=0;i<numberThings;i++) {

		var t = i/(numberThings-1); 				
		var lengthAlongPath = t * lengthRightHump;

   	var p = heartRightSvgPath.node().getPointAtLength(lengthAlongPath);

    var pLeft = heartLeftSvgPath.node().getPointAtLength(lengthAlongPath);


    //draw the line that the hearts will be put on, in order to see about getting the angles
    //we translate and rotate

    //these circles are at the right place, unscaled
    // var thing = heartContainerSvg.append("circle")
    // 															.classed("test-heart-circle", true)
    // 															.attr("cx",p.x)
    // 															.attr("cy",p.y)
    // 															.attr("r",-3 + desiredGap/2);


    //center circle no translate = squareSize/2,0 = (x,y)

  //   var centerNoTranslate = {};

		// centerNoTranslate.x = squareSize/2;
		// centerNoTranslate.y = 0;

		// var xPrime = centerNoTranslate.x * Math.cos(pi_over_4) - centerNoTranslate.y*Math.sin(pi_over_4);
		// var yPrime = centerNoTranslate.x * Math.sin(pi_over_4) + centerNoTranslate.y*Math.cos(pi_over_4);

		// x' = x cos(theta) - y sin(theta)
		// y' = x sin(theta) + y cos(theta)

		//line - put at top, but translate and rotate 


    //p is always along this path
    //it's the line that varies based on where you are

		var thisT = 1.2; //1.25; //0; //1.25;
		var x2Start;
		var y2Start;
		var x2StartLeft;
		var y2StartLeft;

    if (lengthAlongPath <= lengthToFirstTurn) {
			//x2Start =  xScale(xScale.invert(p.x) - squareSize/2); // xScale(0); //p.x; //xScale(0); //(p.x) - p.y;
			x2Start =  xScale(p.x - squareSize/2) + (p.y - yScale(0)); // - squareSize/2; // xScale(0); //p.x; //xScale(0); //(p.x) - p.y;
			//console.log((p.x) - squareSize/2 + ", " + x2Start);
			y2Start = yScale(0);

			x2StartLeft =  xScale(pLeft.x - squareSize/2) + (pLeft.y - yScale(0)); // - squareSize/2; // xScale(0); //p.x; //xScale(0); //(p.x) - p.y;
			//console.log((p.x) - squareSize/2 + ", " + x2Start);
			y2StartLeft = yScale(0);			
    }
    else if (lengthAlongPath < lengthToSquarePart) {
			x2Start = xScale(squareSize/2);
			y2Start = yScale(0);

			x2StartLeft = xScale(0);
			y2StartLeft = yScale(squareSize/2);

    }
    else if (lengthAlongPath < lengthToSquarePart + squareSize/2) {
    	//along the square side part
			x2Start = p.x;
			y2Start = yScale(0);

			x2StartLeft = xScale(0) ; //pLeft.x;
			y2StartLeft = pLeft.y; //yScale(0);

		}
    else {
    	//point at origin
			x2Start = xScale(0);
			y2Start = yScale(0);

			x2StartLeft = xScale(0);
			y2StartLeft = yScale(0);

    }

		var x2 = x2Start + thisT * (p.x - x2Start);
		var y2 = y2Start + thisT * (p.y - y2Start);

		var x2Left = x2StartLeft + thisT * (pLeft.x - x2StartLeft);
		var y2Left = y2StartLeft + thisT * (pLeft.y - y2StartLeft);

		thingsForEachI[i] = {x1:p.x, y1:p.y, x2: x2, y2:y2};
		thingsForEachILeft[i] = {x1:pLeft.x, y1:pLeft.y, x2: x2Left, y2:y2Left};

    // var thingLine = heartContainerSvg.append("line")
    // 															.classed("test-heart-line", true)
    // 															.attr("x1",p.x)
    // 															.attr("y1",p.y)
    // 															.attr("x2", x2) //xScale(squareSize/2)) //0*xPrime - 0*squareSize/2)
    // 															.attr("y2", y2); //yScale(0)); //0*yPrime + 0*height/2);

 		//let's see about doing this via a transformed g
 		//we move the base point to the desired place, and rotate the angle
 		//if in a "straight" region, then there is no rotation
 		//
 		// cos (angle between vectors) = u dot v /(|u| |v|)

 		var transform = "translate(0 0) rotate(0)";
 		var transformLeft = "translate(0 0) rotate(0)";

 		if (i ===0) {
 				//ok
 		}
 		else { //if (i<numberThings-1) {

	 		var translateX =  thingsForEachI[i].x1 - thingsForEachI[0].x1;
	 		var translateY =  thingsForEachI[i].y1 - thingsForEachI[0].y1;


	 		var translateXLeft =  thingsForEachILeft[i].x1 - thingsForEachILeft[0].x1;
	 		var translateYLeft =  thingsForEachILeft[i].y1 - thingsForEachILeft[0].y1;

	 		//put them at the same center and get angle
	 		var u = {x: thingsForEachI[0].x2 - thingsForEachI[0].x1,
								y: thingsForEachI[0].y2 - thingsForEachI[0].y1};

	 		var uLeft = {x: thingsForEachILeft[0].x2 - thingsForEachILeft[0].x1,
								y: thingsForEachILeft[0].y2 - thingsForEachILeft[0].y1};

			u = normalize(u);
			uLeft = normalize(uLeft);
								
	 		var v = {x: thingsForEachI[i].x2 - thingsForEachI[i].x1,
								y: thingsForEachI[i].y2 - thingsForEachI[i].y1};

	 		var vLeft = {x: thingsForEachILeft[i].x2 - thingsForEachILeft[i].x1,
								y: thingsForEachILeft[i].y2 - thingsForEachILeft[i].y1};

			v = normalize(v);
			vLeft = normalize(vLeft);

			var cosine_angle = Math.min(1,u.x * v.x + u.y*v.y);
			var cosine_angleLeft = Math.min(1,uLeft.x * vLeft.x + uLeft.y*vLeft.y);

			cosine_angle = Math.max(-1,cosine_angle);
			cosine_angleLeft = Math.max(-1,cosine_angleLeft);

			// console.log("Cosine Angle...");
			console.log(cosine_angle);

			var angle_between_radians = Math.acos(cosine_angle);
			var angle_between_radiansLeft = Math.acos(cosine_angleLeft);
			console.log("Angle radians left...");
			console.log(angle_between_radiansLeft);


			var angle_between_degrees = radiansToDegrees(angle_between_radians);
			var angle_between_degreesLeft = radiansToDegrees(angle_between_radiansLeft);
			console.log("Angle degrees left...");
			console.log(angle_between_degreesLeft);

			transform = "";
 			transform += "rotate(" + angle_between_degrees + " " + thingsForEachI[i].x1 + " " + thingsForEachI[i].y1 + " )";
 			transform += "translate(" + translateX + " " + translateY + " )";

			transformLeft = "";
 			transformLeft += "rotate(" + (-angle_between_degreesLeft) + " " + thingsForEachILeft[i].x1 + " " + 
 															thingsForEachILeft[i].y1 + " )";
 			transformLeft += "translate(" + translateXLeft + " " + translateYLeft + " )";

 		}

 		//see if we can get it via a transform of the first one

    var thingWithGContainer = heartContainerSvg.append("g")
																			.attr("transform", transform);


    var thingWithGContainerLeft = heartContainerSvg.append("g")
																			.attr("transform", transformLeft);

		//var s = '<image xlink:href="' + heart_url + '" x="0" y="0" height="10px" width="10px"/>';

		//place a few along the line
		var numberHearts = Math.floor(20 * Math.random());

		var imageHeight = 8;

		for (var j=0;j<numberHearts;j++) {

				var deltaX = thingsForEachI[0].x2 - thingsForEachI[0].x1;
				var deltaY = thingsForEachI[0].y2 - thingsForEachI[0].y1;
				var u_start = {x:thingsForEachI[0].x1, y:thingsForEachI[0].y1};
				var u_vector_normalized = normalize({x:deltaX, y:deltaY});
				var theT = imageHeight + (0.75*imageHeight) * (j);
				var thePoint = {x: u_start.x + theT * u_vector_normalized.x - 0.6*imageHeight/2,
													y: u_start.y + theT * u_vector_normalized.y - 0.6*imageHeight/2};

				thingWithGContainer.append("image")
														.attr("xlink:href",heart_url)
														.attr("transform","rotate(45 " + (thePoint.x) + " " + (thePoint.y) + ")")
														.attr("height",imageHeight + "px")
														.attr("width",imageHeight + "px")
														.attr("x", thePoint.x)
														.attr("y", thePoint.y);


				var deltaXLeft = thingsForEachILeft[0].x2 - thingsForEachILeft[0].x1;
				var deltaYLeft = thingsForEachILeft[0].y2 - thingsForEachILeft[0].y1;
				var u_startLeft = {x:thingsForEachILeft[0].x1, y:thingsForEachILeft[0].y1};
				var u_vector_normalizedLeft = normalize({x:deltaXLeft, y:deltaYLeft});
				var theTLeft = imageHeight + (0.75*imageHeight) * (j);
				var thePointLeft = {x: u_startLeft.x + theT * u_vector_normalizedLeft.x - 0.6*imageHeight/2,
													y: u_startLeft.y + theT * u_vector_normalizedLeft.y - 0.6*imageHeight/2};

				thingWithGContainerLeft.append("image")
														.attr("xlink:href",heart_url)
														.attr("transform","rotate(45 " + (thePointLeft.x) + " " + (thePointLeft.y) + ")")
														.attr("height",imageHeight + "px")
														.attr("width",imageHeight + "px")
														.attr("x", thePointLeft.x)
														.attr("y", thePointLeft.y);

		}


		// heartContainerSvg.append("g").attr("transform", transform)
																			
    // var thingLineWithG = thingWithGContainer.append("line")
				// 	    															.classed("test-heart-line-g", true)
				// 	    															.attr("x1",thingsForEachI[0].x1)
				// 	    															.attr("y1",thingsForEachI[0].y1)
				// 	    															.attr("x2", thingsForEachI[0].x2)
				// 	    															.attr("y2", thingsForEachI[0].y2); 



 }


  // return function(d, i, a) {
  //   return function(t) {
  //     var p = path.getPointAtLength(t * l);

//we need to set up the locations on the path
//AND the angle
//
// we have a start point, and a line to place the hearts on
// wrapped in a <g> that is moved along the path to the next one
//
// need to write this down and look at it
// it will depend on the width of the hearts and margin around each stack (if any)
//
// also, how to move along the curve...
//0 is the center, no duplicate
//1 is one on either side of the center




//pass a batch of tweets to use for the same "stack"
returnedThing.addNewTweetBurst = function(tweets) {

	//we do several things
	//
	// * move current ones down
	// * anything past the last one is deleted

	//
	// * add new ones, via quick "stack animation" of the things

};

returnedThing.addNewTweet = function(tweet) {

	//this one gets the full tweet

};

return returnedThing;

};