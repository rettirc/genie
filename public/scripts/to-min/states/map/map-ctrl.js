angular.module('genie.map-ctrl', [])
.controller('MapCtrl', function($scope, d3) {

	function Main($scope) {
	  $scope.newTime = 2000;
	}

	//func called when value in min year field is changed to show travel past that date
	$scope.$watch('newTime', function(newValue) {
		if(newValue) {
			travelRange(newValue);
		}
	});

	//func called on button click to display death/birthplace distribution
	$scope.deathBirthPlaces = function(route) {
		deathBirthPlaces()
	}

	var mapDict
	var width = 960;
	var height = 500;

	// D3 Projection
	var projection = d3.geoAlbersUsa()
					   .translate([width/2, height/2])    // translate to center of screen
					   .scale([1000]);          // scale things down so see entire US

	// Define path generator
	var path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
			  	 .projection(projection);  // tell path generator to use albersUsa projection


	// Define linear scale for output
	var color = d3.scaleLinear()
				  .range(["white","blue"]);

	var legendText = ["Cities Lived", "States Lived", "States Visited", "Nada"];

	//Create SVG element and append map to the SVG
	var svg = d3.select("#mapView")
				.append("svg")
				.attr("width", width)
				.attr("height", height);

	// Append Div for tooltip to SVG
	var div = d3.select("body")
			    .append("div")
	    		.attr("class", "tooltip")
	    		.style("opacity", 0);

	//Function called to display places traveled past a certain date
	function travelRange(start) {
		d3.json("data/river-force-test.json", function(error,all_json) {
			highlightStateTravelRange(all_json, start)
		})
	}

	//Function called to display death/birth place distribution on states
	function deathBirthPlaces() {
		d3.json("data/river-force-test.json", function(error,all_json) {
			hightlightBirthDeathPlaces(all_json)
		})
	}

	//Highlight death/birthplaces by default
	d3.json("data/river-force-test.json", function(error,all_json) {
		hightlightBirthDeathPlaces(all_json)
	})

	//Function to show world map, and allow clickable of US
	//TODO: Fix the world view so that is starts with this view and when clicked
	//moves to the highlighted us map Corey did

	// function worldMap(all_json, start) {
	// 	mapDict = {}
	//
	// 	color.domain([0,4]);
	//
	// 	d3.json("data/world-countries.json", function(countries_json) ) {
	// 		svg.selectAll("path")
	// 			.data(location_json.features)
	// 			.enter()
	// 			.append("path")
	// 			.attr("d", path)
	// 			.style("stroke", "#fff")
	// 			.style("stroke-width", "1");
	// 	}
	// }

	//updates the mapdict with travel data and updates the map view
	function highlightStateTravelRange(all_json, start) {
		mapDict = {}
		//set degree of color gradient by changing max ([min, max])
		color.domain([0, 4]);
		//unpack the state JSON. Contains state names as well as geo data for map shape and position
		d3.json("data/us-states.json", function(states_json) {
			//initialize the mapDict
			for (var j = 0; j < states_json.features.length; j++)  {
				mapDict[states_json.features[j].properties.name] = 0;
			}
			// Loop through each state data value in the inputted json file
			for (var i = 0; i < all_json.nodes.length; i++) {
				// Grab the map of states traveled to
				var travelJson = all_json.nodes[i].travel
				if (travelJson) {
					visitedStates = Object.keys(travelJson)
					//for each state, create/increment the map entry
					for (var j = 0; j < visitedStates.length; j++) {
						if (travelJson[visitedStates[j]] >= start) {
							mapDict[visitedStates[j]] += 1
						}
					}
				}
			}
			//show results on the map
			highlightLocations(states_json)
		});
	}

	//updates the mapdict with travel data and updates the map view
	function highlightStateTravel(all_json) {
		mapDict = {}
		//set degree of color gradient by changing max ([min, max])
		color.domain([0, 4]);
		//unpack the state JSON. Contains state names as well as geo data for map shape and position
		d3.json("data/us-states.json", function(states_json) {
			//initialize the mapDict
			for (var j = 0; j < states_json.features.length; j++)  {
				mapDict[states_json.features[j].properties.name] = 0;
			}
			// Loop through each state data value in the inputted json file
			for (var i = 0; i < all_json.nodes.length; i++) {
				// Grab the map of states traveled to
				var travelJson = all_json.nodes[i].travel
				if (travelJson) {
					visitedStates = Object.keys(travelJson)
					//for each state, create/increment the map entry
					for (var i = 0; i < visitedStates.length; i++) {
						mapDict[visitedStates[i]] += 1
					}
				}
			}
			//show results on the map
			highlightLocations(states_json)
		});
	}

	//Hightlight where people were born and died
	function hightlightBirthDeathPlaces(all_json) {
		//clear the map dict, may have any set of locations
		mapDict = {}
		//unpack the state JSON. Contains state names as well as geo data for map shape and position
		d3.json("data/us-states.json", function(states_json) {
			//initialize the mapDict
			for (var j = 0; j < states_json.features.length; j++)  {
				mapDict[states_json.features[j].properties.name] = 0
			}
			//set degree of color gradient by changing max ([min, max])
			color.domain([0, 4]);
			// Loop through each inidivdual data value in the inputted json file
			for (var i = 0; i < all_json.nodes.length; i++) {
				// Grab death/birth state Name
				var birthState = all_json.nodes[i].birth_loc;
				var deathState = all_json.nodes[i].death_loc;
				//if either piece of data is included, update to dict
				mapDict[birthState] += 1;
				mapDict[deathState] += 1;
			}
			//show results on the map
			highlightLocations(states_json)
		});
	}

	//update the map to display the contents of mapDict
	function highlightLocations(location_json) {
		// Bind the data to the SVG and create one path per GeoJSON feature
		svg.selectAll("*").remove()
		svg.selectAll("path")
			.data(location_json.features)
			.enter()
			.append("path")
			.attr("d", path)
			.style("stroke", "#fff")
			.style("stroke-width", "1")
			.style("fill", function(d) {
				// Get data value
				var value = mapDict[d.properties.name];
				if (value) {
					//If value exists set the state
					return color(Math.min(value, 4));
				} else {
					//If value is undefined…
					return "rgb(213,222,217)";
				}
			});
	}
});
