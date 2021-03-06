var boxesClicked = 1;
var numBoxes = 1;
var MAX_BOXES = 10;
var MIN_BOXES = 1

var MAX_INT = Math.pow(2, 53) -1;
var MIN_INT = -MAX_INT;

var functionNumber = 1;

var ACKLEY_FUNCTION_NUM = 1;
var ROSENBROCK_FUNCTION_NUM = 2;
var RASTRIGIN_FUNCTION_NUM = 3;

var functionNumber = 1;
var functionNames = {1: "ackley", 2:"rosenbrock", 3:"rastrigin"};
var errorMessage = "";
//1 ackley
//2 rosenbrock
//3 rastrigin



//add number of particles
//add number of dimensions

$(function(){

	$("#addBoxes").on("click", function(){
		addBoxes("boxes");
	});

	$("#removeBoxes").on("click", function(){
		removeBoxes("boxes");
	});

	$("#csvID").on("click", function(){

		//clicking from boxes
		if(boxesClicked === 1){
			boxesClicked = 0;

			$("#csv").toggle();
			$("#boxWrapper").toggle();
			$("#controlsWrapper").toggle();

		}

	});

	$("#boxesID").on("click", function(){

		//clicking from CSV
		if(boxesClicked === 0){
			boxesClicked = 1;
			$("#csv").toggle();
			$("#boxWrapper").toggle();
			$("#controlsWrapper").toggle();

		}
			
	});

	$("#ackley").on("click", function(){
		functionNumber = ACKLEY_FUNCTION_NUM;
	});
	$("#rosenbrock").on("click", function(){
		functionNumber = ROSENBROCK_FUNCTION_NUM;
	});
	$("#rastrigin").on("click", function(){
		functionNumber = RASTRIGIN_FUNCTION_NUM;
	});

	$("#functionForm").on("submit", function(){

		var useBoxes = boxesClicked;




		runCalculationWithParameters(event, $("#functionForm").serializeArray());

	});
	
});

//need form validation
function parseBoxesForNumbers(arrayFromForm){

	var arrayOfDimensions = [];
	var foundError = 0;

	for(var i = 2; i < arrayFromForm.length-1; i++){
		if(!isNumeric(arrayFromForm[i].value)){
			foundError = 1;
			var index = (i-1).toString();
			addError("Error: non-numeric value in box number " + index +". Please correct to be able to submit");
		}
		else{
			arrayOfDimensions.push(parseFloat(arrayFromForm[i].value));
		}
	}

	if(foundError){
		return [];
	}

	return arrayOfDimensions;
}

function getDimensionsWithoutError(arrayFromForm){


	var dimensions = [];

	if(arrayFromForm[1].value === "boxes"){
		dimensions = parseBoxesForNumbers(arrayFromForm);
		if(dimensions.length === 0){
			console.log("dimensions = [] empty")
			postErrorsAndResetErrorMessage();
			return [];
		}
	}
	else{
		//parse CSV field
		var dimensionsText = $("#csvInput").val();
		dimensions = dimensionsText.split(",");

		//make sure it is numeric, otherwise false and correction condition		
		for(var i = 0; i < dimensions.length; i++){
			if(!isNumeric(dimensions[i])){
				addError("Error: non-numeric value at position " + (i+1).toString() +" of your CSV. Please correct to be able to submit");
				dimensions = [];
				postErrorsAndResetErrorMessage();
				return [];	
			}
		}
		//do this so we can get everything as a separate item, removes empty strings, etc.
		var spacedString = "";
		for(var i =0; i < dimensions.length; i++){
			spacedString+=dimensions[i] + " ";
		}
		dimensions = spacedString.split(" ");
		
		dimensions = dimensions.filter(function(value){
			return value != "";
		});
		for(var i = 0; i < dimensions.length; i++){
			dimensions[i] = parseInt(dimensions[i]);
		}
	}
	return dimensions;
}

function runCalculationWithParameters(event, arrayFromForm){
	hideErrors();
	hideResults();
	event.preventDefault()
	//console.log(arrayFromForm);
	var funcName = functionNames[functionNumber];

	var dimensions = getDimensionsWithoutError(arrayFromForm);
	if(dimensions.length === 0){
		postErrorsAndResetErrorMessage();
		console.log("her");
		return false;
	}
	console.log(dimensions);
	var functionResult = 0;

	switch(funcName){
		case "ackley":
			functionResult = runAckleyWithDimensions(dimensions);
			break;
		case "rastrigin":
			functionResult = runRastriginWithDimensions(dimensions);
			break;
		case "rosenbrock":
			functionResult = runRosenbrockWithDimensions(dimensions);
			break;
		default:
			break;
	}


	//probably unnecessary
	if(functionResult >= MAX_INT || functionResult <= MIN_INT || !isFinite(functionResult) || isNaN(functionResult)){
		functionResult = NaN;
	}

	if(isNaN(functionResult)){
		addError("Uh-oh. It looks like we encountered an overflow from our parsing of your inputs. We hope this wasn't intentional :)");
		postErrorsAndResetErrorMessage(functionResult);
		//errorMessage = "";
		return false;
	}
	else{
		console.log(functionResult);
		showResults(functionResult);
	}

}

function runAckleyWithDimensions(dimensions){

	var firstBracket = 0;
	var secondBracket = 0;
	var finalSum = 0;

	for(var i = 0; i < dimensions.length; i++){
		firstBracket += (dimensions[i] * dimensions[i]);
	}
	firstBracket = parseFloat(firstBracket);
	firstBracket *= (1.00 / parseFloat(dimensions.length));
	firstBracket = Math.sqrt(firstBracket);
	firstBracket *= -0.2;
	//console.log(firstBracket);

	for(var i = 0; i < dimensions.length; i++){
		secondBracket += Math.cos(2* Math.PI * dimensions[i]);
	}
	secondBracket *= (1.00 / parseFloat(dimensions.length));

	finalSum = -20.00 * Math.pow(Math.E, firstBracket) - Math.pow(Math.E, secondBracket) + 20.00 + Math.E;

	return finalSum;
}

function runRosenbrockWithDimensions(dimensions){

	var evaluation = 0;

	for(var i = 0; i < dimensions.length-1; i++){

		product = dimensions[i+1] - dimensions[i] * dimensions[i];

		evaluation += (100 * (product * product) + (dimensions[i] - 1) * (dimensions[i] -1) );
	}
	return evaluation;
}

function runRastriginWithDimensions(dimensions){

	var sum = 0;

	for(var i = 0; i < dimensions.length; i++){
		sum += ( ( dimensions[i] * dimensions[i]) - (10 * Math.cos(2 * Math.PI * dimensions[i])) +10 );
	}
	return sum;
}

function addError(message){
	errorMessage += "<p>"+message + "</p>";
}


function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

//post errors to error / warning div
function postErrorsAndResetErrorMessage(){
	$("#errors").html(errorMessage);
	$("#errors").show();
//	errorMessage = "";
}

function hideErrors(){
	$("#errors").hide();
	errorMessage = "";

}

function addBoxes(div){

	if(numBoxes < MAX_BOXES){
		var boxHTML = '<input type="text" name="' + numBoxes.toString() + '" value="0">';
		$("#" + div).append(boxHTML);
		numBoxes+=1;

	}
}

function removeBoxes(div){

	if(numBoxes > MIN_BOXES){
		$("#"+div).children().last().remove();
		numBoxes-=1;

	}
}

function hideBoxes(div){
	$("#" + div).each(function(){
		$(this).toggle();
	});
};

function showCSVField(div){
	$("#"+div).toggle();
}

function showResults(results){
	$("#results").text(results);
	$("#results").show();
	$("#results").attr("display", "block");
}

function hideResults(){
	$("#results").hide();
}


/*

*/
//ADD FAILURE CASES ABOVE TO CORRECT INPUT, CORRECTIONS ABOUT SIZE, LENGTH OF THINGS , LIMITS OF FUNCTIONS, 

/*
TODO: finish runCalculationWithParameters
	  form validation for csv and boxes
	  parseBoxesForNumbers with dimensions that arent numerical
*/


/*
RESOURCES:

http://stackoverflow.com/questions/9716468/is-there-any-function-like-isnumeric-in-javascript-to-validate-numbers



*/

/*
Tips:

you can use the return value of a function to prevent form submission
*/
