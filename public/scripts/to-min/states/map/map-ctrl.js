angular.module('genie.map-ctrl', [])
.controller('MapCtrl', function($scope, d3) {

	$scope.newTimeMin = {
		value: 2000
	};

	$scope.newTimeMax = {
		value: 2017
	};

	$scope.mapScope = {
		value: 2017
	};

	$scope.mapScopeData = {
		model: null,
		availableOptions: [
        	{
				value: 'us',
				name: 'US'
			},
        	{
				value: 'globe',
				name: 'Globe'
			}
    	]
	}

	$scope.mapTypeData = {
		model: null,
		availableOptions: [
        	{
				value: 'travel',
				name: 'Locations Traveled'
			},
        	{
				value: 'birthDeath',
				name: 'Locations of Birth and Death'
			}
    	]
	}

	//func called when value in min year field is changed to show travel past that date
	$scope.$watch('newTimeMin.value', function(newValue) {
		if(newValue) {
			minTime = newValue;
			mapType = "travel"
			updateMap();
		}
	});

	//func called when value in max year field is changed to show travel past that date
	$scope.$watch('newTimeMax.value', function(newValue) {
		if(newValue) {
			maxTime = newValue;
			mapType = "travel"
			updateMap();
		}
	});

	//func called when zoom out button is pressed; zooms out to the last map view on the stack
	$scope.zoomOut = function() {
		mapScope = prevView
		updateMap()
	}

	//func called when value in min year field is changed to show travel past that date
	$scope.$watch('mapTypeData.model', function(newValue) {
		if(newValue) {
			console.log("value");
			mapType = newValue
			updateMap()
		}
	});

	var mapDict = {}
	var mapScope = "globe" //us or globe
	var mapType = "travel" //birthDeath or travel
	var width = 960;
	var height = 500;
	var maxTime = 2017;
	var minTime = 0;
	var prevView = 'globe'

	// D3 Projection
	var projection = d3.geoAlbersUsa()
					   .translate([width/2, height/2])    // translate to center of screen
					   .scale([1000]);          // scale things down so see entire US

	// D3 World Projection; geoAlbersUsa creates a map zoomed into us only
	var worldProjection = d3.geoEquirectangular()
						.scale(height / Math.PI);

	// Define path generator
	var path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
			  	 .projection(projection);  // tell path generator to use albersUsa projection

  // World path for the world projection rather than US

	var worldPath = d3.geoPath()
						.projection(worldProjection);

	// Define linear scale for output
	var color = d3.scaleLinear()
				  .range(["white","blue"]);

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

	function updateMap() {
		d3.json("data/river-force-test.json", function(error,all_json) {
			if (mapScope == "us") {
				console.log("us");
				if (mapType == "travel") {
					console.log("travel");
					highlightStateTravel(all_json)
				} else if (mapType == "birthDeath") {
					console.log("bd");
					hightlightBDState(all_json)
				}
			} else if (mapScope = "globe") {
				console.log("globe");
				if (mapType == "travel") {
					console.log("travel");
					highlightGlobalTravel(all_json)
				} else if (mapType == "birthDeath") {
					console.log("bd");
					hightlightBDGlobal(all_json)
				}
			}
		})

	}

	//updates the mapdict with travel data and updates the map view
	function highlightStateTravel(all_json) {
		hightlightTravel(all_json, "data/us-states.json", 'S')
	}

	//updates the mapdict with travel data and updates the map view
	function highlightGlobalTravel(all_json) {
		hightlightTravel(all_json, "data/world-countries.json", 'G')
	}

	//GS is a variable to establish whether we have a global view or state view
	function hightlightTravel(all_json, mapPath, GS) {
		mapDict = {}
		//set degree of color gradient by changing max ([min, max])
		color.domain([0, 4]);
		//unpack the state JSON. Contains state names as well as geo data for map shape and position
		d3.json(mapPath, function(loc_json) {
			//initialize the mapDict
			for (var j = 0; j < loc_json.features.length; j++)  {
				mapDict[loc_json.features[j].properties.name] = 0;
			}
			// Loop through each state data value in the inputted json file
			for (var i = 0; i < all_json.nodes.length; i++) {
				// Grab the map of states traveled to
				var travelJson = all_json.nodes[i].travel
				if (travelJson) {
					visitedStates = Object.keys(travelJson)
					//for each state, create/increment the map entry
					for (var x = 0; x < visitedStates.length; x++) {
						if (travelJson[visitedStates[x]] >= minTime
							&& travelJson[visitedStates[x]] <= maxTime) {
							mapDict[visitedStates[x]] += 1
						}
					}
				}
			}
			highlightLocations(loc_json)
		});
	}

	//Hightlight where people were born and died
	function hightlightBDState(all_json) {
		hightlightBD(all_json, "data/us-states.json", 'S')
	}

	//Hightlight where people were born and died
	function hightlightBDGlobal(all_json) {
		hightlightBD(all_json, "data/world-countries.json", 'G')
	}

	function hightlightBD(all_json, mapPath, GS) {
		//clear the map dict, may have any set of locations
		mapDict = {}
		//unpack the state JSON. Contains state names as well as geo data for map shape and position
		d3.json(mapPath, function(loc_json) {
			//initialize the mapDict
			for (var j = 0; j < loc_json.features.length; j++)  {
				mapDict[loc_json.features[j].properties.name] = 0
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
			highlightLocations(loc_json)
		});
	}

	//update the map to display the contents of mapDict
	//TODO: allow zoomability...also apparently make it work
	function highlightLocations(location_json) {
		locationPath = null;
		switch (mapScope) {
			case "us":
				prevView = 'globe'
				locationPath = path
				break;
			case "globe":
				locationPath = worldPath
				break;
			default:
				locationPath = path
		}
		// Bind the data to the SVG and create one path per GeoJSON feature
		svg.selectAll("*").remove()
		svg.selectAll("path")
			.data(location_json.features)
			.enter()
			.append("path")
			.attr("d", locationPath)
			.on("click", onClick)
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
	//Function to zoom in when a country is clicked
	function onClick(d) {
		if (d.id == 'USA') {
			mapScope = 'us';
			updateMap();
		}
	}
});
