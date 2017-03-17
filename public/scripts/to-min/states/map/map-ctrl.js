angular.module('genie.map-ctrl', [])
.controller('MapCtrl', function($scope, d3, $http) {

	$scope.newTimeMin = {
		value: 1700
	};

	$scope.newTimeMax = {
		value: 2000
	};

	$scope.mapScope = {
		value: "us"
	};

	$scope.mapScopeData = {
		model: 'us',
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
		model: 'birthDeath',
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
			updateMap();
		}
	});

	//func called when value in max year field is changed to show travel past that date
	$scope.$watch('newTimeMax.value', function(newValue) {
		if(newValue) {
			maxTime = newValue;
			updateMap();
		}
	});

	//func called when zoom out button is pressed; zooms out to the last map view on the stack
	$scope.zoomOut = function() {
		mapScope = prevView.pop();
		updateMap()
	}

	//func called when value in min year field is changed to show travel past that date
	$scope.$watch('mapTypeData.model', function(newValue) {
		if(newValue) {
			mapType = newValue
			updateMap()
		}
	});

	var mapDict = {}
	var mapScope = "us" //us or globe
	var mapType = "birthDeath" //birthDeath or travel
	var width = 960;
	var height = 500;
	var maxTime = 2017;
	var minTime = 0;
	var prevView = new Array();
    var colorGradient = 100

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
				  .range(["rgb(213,222,217)","blue"]);

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
		locations = [];
		$http.get('api/locations').then(function(all_json, error) {
			if(!error) {
			    if (mapScope == "us") {
			// 		if (mapType == "travel") {
			// 			highlightStateTravel(all_json)
			// 		} else if (mapType == "birthDeath") {
			         highlightBDState(all_json.data)
			// 		}
				} else if (mapScope = "globe") {
			// 		if (mapType == "travel") {
			// 			highlightGlobalTravel(all_json)
			// 		} else if (mapType == "birthDeath") {
				     highlightBDGlobal(all_json.data)
			// 		}
				}
			} else {
				console.log(error);
			}
		});

		// d3.json("data/river-force-test.json", function(error, all_json) {
		// 	if(!error) {
		// 		if (mapScope == "us") {
		// 			if (mapType == "travel") {
		// 				highlightStateTravel(all_json)
		// 			} else if (mapType == "birthDeath") {
		// 				highlightBDState(all_json)
		// 			}
		// 		} else if (mapScope = "globe") {
		// 			if (mapType == "travel") {
		// 				highlightGlobalTravel(all_json)
		// 			} else if (mapType == "birthDeath") {
		// 				highlightBDGlobal(all_json)
		// 			}
		// 		}
		// 	} else {
		// 		console.log(error);
		// 	}
		// })
	}

	//updates the mapdict with travel data and updates the map view
	function highlightStateTravel(all_json) {
		highlightTravel(all_json, "data/us-states.json", 'S')
	}

	//updates the mapdict with travel data and updates the map view
	function highlightGlobalTravel(all_json) {
		highlightTravel(all_json, "data/world-countries.json", 'G')
	}

	function highlightTravel(all_json, mapPath) {
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
				// Grab the map of locations traveled to
				var travelJson = all_json.nodes[i].travel
				if (travelJson) {
					visitedLocs = Object.keys(travelJson)
					//for each state, create/increment the map entry
					for (var x = 0; x < visitedLocs.length; x++) {
						if (travelJson[visitedLocs[x]] >= minTime
							&& travelJson[visitedLocs[x]] <= maxTime) {
							mapDict[visitedLocs[x]] += 1
						}
					}
				}
			}
			highlightLocations(loc_json)
		});
	}

	//Highlight where people were born and died
	function highlightBDState(all_json) {
        locs = convertToStateLocDates(all_json)
		highlightBD(locs, "data/us-states.json", 'S')
	}

    function convertToStateLocDates(all_json) {
        var states = [];
        for (var i = 0; i < all_json.length; i++) {
            var locStr = all_json[i].loc;
            if (locStr) {
                var arr = locStr.split(",");
                for (index = 0; index < arr.length; index++) {
                    element = arr[index].trim()
                    if (stateNameDict[element] != null) {
                        states.push(new locDate(stateNameDict[element], formatDate(all_json[i].date)));
                    }
                }
            }
        }
        return states
    }

    function formatDate(date) {
        if(date) {
            var newDate
            newDate = parseInt(date.substr(6,4))
            return newDate
        }
    }

	//Highlight where people were born and died
	function highlightBDGlobal(all_json) {
		highlightBD(all_json, "data/world-countries.json", 'G');
	}

	function highlightBD(locs, mapPath) {
		//clear the map dict, may have any set of locations
		mapDict = {}
		//unpack the state JSON. Contains state names as well as geo data for map shape and position
		d3.json(mapPath, function(loc_json) {
			//initialize the mapDict
			for (var j = 0; j < loc_json.features.length; j++)  {
				mapDict[loc_json.features[j].properties.name] = 0
			}
			//set degree of color gradient by changing max ([min, max])
			color.domain([0, colorGradient]);
			// Loop through each inidivdual data value in the inputted json file
			for (var i = 0; i < locs.length; i++) {
				//if either piece of data is included, update to dict
				if (locs[i].date && locs[i].date >= minTime && locs[i].date <= maxTime) {
				    mapDict[locs[i].loc] += 1;
				}
			}
			//show results on the map
			highlightLocations(loc_json)
		});
	}

	//update the map to display the contents of mapDict
	function highlightLocations(location_json) {
		locationPath = null;
		switch (mapScope) {
			case "us":
				prevView.push('globe');
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
					return color(Math.min(value, colorGradient));
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

    function locDate(loc, date) {
        this.date = date;
        this.loc = loc;
    }

    var stateNameDict = {
        'Arizona':'Arizona',
        'Alabama':'Alabama',
        'Alaska':'Alaska',
        'Arizona':'Arizona',
        'Arkansas':'Arkansas',
        'California':'California',
        'Colorado':'Colorado',
        'Connecticut':'Connecticut',
        'Delaware':'Delaware',
        'Florida':'Florida',
        'Georgia':'Georgia',
        'Hawaii':'Hawaii',
        'Idaho':'Idaho',
        'Illinois':'Illinois',
        'Indiana':'Indiana',
        'Iowa':'Iowa',
        'Kansas':'Kansas',
        'Kentucky':'Kentucky',
        'Louisiana':'Louisiana',
        'Maine':'Maine',
        'Maryland':'Maryland',
        'Massachusetts':'Massachusetts',
        'Michigan':'Michigan',
        'Minnesota':'Minnesota',
        'Mississippi':'Mississippi',
        'Missouri':'Missouri',
        'Montana':'Montana',
        'Nebraska':'Nebraska',
        'Nevada':'Nevada',
        'New Hampshire':'New Hampshire',
        'New Jersey':'New Jersey',
        'New Mexico':'New Mexico',
        'New York':'New York',
        'North Carolina':'North Carolina',
        'North Dakota':'North Dakota',
        'Ohio':'Ohio',
        'Oklahoma':'Oklahoma',
        'Oregon':'Oregon',
        'Pennsylvania':'Pennsylvania',
        'Rhode Island':'Rhode Island',
        'South Carolina':'South Carolina',
        'South Dakota':'South Dakota',
        'Tennessee':'Tennessee',
        'Texas':'Texas',
        'Utah':'Utah',
        'Vermont':'Vermont',
        'Virginia':'Virginia',
        'Washington':'Washington',
        'West Virginia':'West Virginia',
        'Wisconsin':'Wisconsin',
        'Wyoming':'Wyoming',
        'AZ':'Arizona',
        'AL':'Alabama',
        'AK':'Alaska',
        'AZ':'Arizona',
        'AR':'Arkansas',
        'CA':'California',
        'CO':'Colorado',
        'CT':'Connecticut',
        'DE':'Delaware',
        'FL':'Florida',
        'GA':'Georgia',
        'HI':'Hawaii',
        'ID':'Idaho',
        'IL':'Illinois',
        'IN':'Indiana',
        'IA':'Iowa',
        'KS':'Kansas',
        'KY':'Kentucky',
        'LA':'Louisiana',
        'ME':'Maine',
        'MD':'Maryland',
        'MA':'Massachusetts',
        'MI':'Michigan',
        'MN':'Minnesota',
        'MS':'Mississippi',
        'MO':'Missouri',
        'MT':'Montana',
        'NE':'Nebraska',
        'NV':'Nevada',
        'NH':'New Hampshire',
        'NJ':'New Jersey',
        'NM':'New Mexico',
        'NY':'New York',
        'NC':'North Carolina',
        'ND':'North Dakota',
        'OH':'Ohio',
        'OK':'Oklahoma',
        'OR':'Oregon',
        'PA':'Pennsylvania',
        'RI':'Rhode Island',
        'SC':'South Carolina',
        'SD':'South Dakota',
        'TN':'Tennessee',
        'TX':'Texas',
        'UT':'Utah',
        'VT':'Vermont',
        'VA':'Virginia',
        'WA':'Washington',
        'WV':'West Virginia',
        'WI':'Wisconsin',
        'WY':'Wyoming',
    };
});
