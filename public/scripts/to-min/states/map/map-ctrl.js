angular.module('genie.map-ctrl', [])
.controller('MapCtrl', function($scope, d3, $http) {
    //Initial display
    updateMap()

    //Initialize scope variables used in UI and watched by controller
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

	//Called when value minTime is changed to show travel past that date
	$scope.$watch('newTimeMin.value', function(newValue) {
        if (initializing < 3) {
            initializing++;
        } else {
            if(newValue) {
                minTime = newValue;
                updateMap();
            }
        }
	});

	//Called when value maxTime field is changed to show travel past that date
	$scope.$watch('newTimeMax.value', function(newValue) {
        if (initializing < 3) {
            initializing++;
        } else {
            if(newValue) {
    			maxTime = newValue;
    			updateMap();
    		}
        }
	});

	//Called when zoom out button is pressed; zooms to the last map on the stack
	$scope.zoomOut = function() {
		mapScope = prevView.pop();
		updateMap()
	}

  //Called when the start button is pressed for the time lapse
  $scope.startTimeLapse = function() {
    stopTime = false;
    startTimeLapseHelper();
  }

  //Called to stop the time lapse
  //TODO: change this up so that it is a pause that can then resume
  $scope.stopTimeLapse = function() {
    stopTime = true;
  }

	// Called when value mapType is changed to show travel past that date
	$scope.$watch('mapTypeData.model', function(newValue) {
        if (initializing < 3) {
            initializing++;
        } else {
            if(newValue) {
    			mapType = newValue
    			updateMap()
    		}
        }
	});

	var mapDict = {} //location name mapped to current number of people
	var mapScope = "us" //us or globe
	var mapType = "birthDeath" //birthDeath or travel
  var baseColor = "CFCCF5" //color for 0 people, gray: "rgb(213,222,217)"
	var width = 960; //map dimens
	var height = 500;
	var maxTime = 2000; //time range displayed min to max, updated by watch
	var minTime = 1700;
	var prevView = new Array(); //stack to hold previous scale of map
  var colorGradient = 9 //size of color range
  var initializing = 0 //var used to track/avoid 3 initial reloads
  var stopTime = false; //var used to stop time lapse

	// D3 Projection
	var projection = d3.geoAlbersUsa()
					   .translate([width/2, height/2]) // move to center screen
					   .scale([1000]); // scale things down so see entire US

	// D3 World Projection; geoAlbersUsa creates a map zoomed into us only
	var worldProjection = d3.geoEquirectangular()
						.scale(height / Math.PI);

	// Define US path generator
	var usPath = d3.geoPath()
			  	 .projection(projection);

    // World path for the world projection rather than US
	var worldPath = d3.geoPath()
						.projection(worldProjection);

	// Define linear scale for output color
    var color = d3.scaleThreshold()
        .domain(d3.range(0, colorGradient))
        .range(["CFCCF5", "B7B2F1", "9F99EC", "877FE8",
                "6F66E3", "574CDE", "3F33DA", "2719D5", "0F00D1"]);

	//Create SVG element and append map to the SVG
	var svg = d3.select("#mapView")
				.append("svg")
				.attr("width", width)
				.attr("height", height);

	// Append Div to show state name and number of people on mouseover
	var div = d3.select("body")
	    .append("div")
		.attr("class", "tooltip")
        .style("background-color", "rgb(255,255,255)")
        .style("padding", "5px")
		    .style("moz-border-radius", "6px")
        .style("border-radius", "6px")
        .style("opacity", 0);

    //Exponential scale for color limits
    expScale = d3.scaleLinear()
        .domain(d3.range(0, colorGradient))
        .range([1, 10, 25, 50, 90, 100, 150, 200, 500]);

    function addKey() {
        //Linear scale to translate values to screen x coors
        var x = d3.scaleLinear()
            .domain(d3.range(0, colorGradient))
            .rangeRound([545, 575]);

        //create/add the key
        var g = svg.append("g")
            .attr("class", "key")
            .attr("transform", "translate(0,40)");

        //Color and space the rectangles of the key
        g.selectAll("rect")
            .data(color.range().map(function(d) {
                d = color.invertExtent(d);
                if (d[0] == null) d[0] = x.domain()[0];
                if (d[1] == null) d[1] = x.domain()[1];
                return d;
            }))
            .enter().append("rect")
            .attr("height", 8)
            .attr("x", function(d) { return x(d[0]); })
            .attr("width", function(d) { return x(d[1]) - x(d[0]) + (d[1] != colorGradient - 1 ? 5 : 1); })
            .style("border-color", function(d) { return color(d[0]); })
            .style("fill", function(d) { return color(d[0]); });

        //Add key title
        g.append("text")
            .attr("class", "caption")
            .attr("x", x.range()[0])
            .attr("y", -6)
            .attr("fill", "#000")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text("Number of People");

        //Add tick labels
        g.call(d3.axisBottom(x)
            .tickSize(13)
            .tickValues(color.domain())
            .tickFormat(function(d) {
                return expScale(d);
            }))
          .select(".domain")
            .remove();
    }

    //Initially add the key
    addKey()

    //Choose what map to display then update it with new global var values
	function updateMap() {
		locations = [];
        //Get locations from sqlite database
		$http.get('api/locations').then(function(all_json, error) {
			if(!error) {
			    if (mapScope == "us") {
            // For travel implementation
			// 		if (mapType == "travel") {
			// 			highlightStateTravel(all_json)
			// 		} else if (mapType == "birthDeath") {
			         highlightBDState(all_json.data)
			// 		}
				} else if (mapScope = "globe") {
            // For travel implementation
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

        //For dummy data demo
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

	//updates the mapdict with travel data and updates the US map view
	function highlightStateTravel(all_json) {
		highlightTravel(all_json, "data/us-states.json")
	}

	//updates the mapdict with travel data and updates the global map view
	function highlightGlobalTravel(all_json) {
		highlightTravel(all_json, "data/world-countries.json")
	}

    //Clear the current map/data and collect/display new data based on inputs
	function highlightTravel(all_json, mapPath) {
        //clear current data
        mapDict = {}
        //unpack JSON with state names and geo data for map shape and position
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
            //execute d3 commands to display new data in the UI
			highlightLocations(loc_json)
		});
	}

	//Highlight where people were born and died
	function highlightBDState(all_json) {
        locs = convertToStateLocDates(all_json)
		highlightBD(locs, "data/us-states.json", 'S')
	}

	//Highlight where people were born and died globally
	function highlightBDGlobal(all_json) {
		highlightBD(all_json, "data/world-countries.json", 'G');
	}

    //Update UI with locatins of birth/death based on time of birth/death
	function highlightBD(locs, mapPath) {
		//clear the map dict, may have any set of locations
		mapDict = {}
		//unpack JSON with state names and geo data for map shape and position
		d3.json(mapPath, function(loc_json) {
			//initialize the mapDict
			for (var j = 0; j < loc_json.features.length; j++)  {
				mapDict[loc_json.features[j].properties.name] = 0
			}
			// Loop through each inidivdual data value in the inputted json file
			for (var i = 0; i < locs.length; i++) {
				//if either piece of data is included, update to dict
				if (locs[i].date && locs[i].date >= minTime
                    && locs[i].date <= maxTime) {
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
				locationPath = usPath
				break;
			case "globe":
				locationPath = worldPath
				break;
			default:
				locationPath = usPath
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
				// Get number of people in this location
				var value = mapDict[d.properties.name];
				if (value) {
					//If value exists set the location's color accordingly
					return color(Math.min(expScale.invert(value),
                        colorGradient));
				} else {
					//If value is undefined set the location's color to default
					return baseColor;
				}
			})
            .on("mouseover", function(d) {
                //Show div w/location name and number of people on mouseover
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                    div.text(d.properties.name + ": "
                        + mapDict[d.properties.name])
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px")
                    .style("pointer-events", "none");
                d3.select(this).style("opacity", .8);
            })
            .on("mouseout", function(d) {
                //Hide div on mouseoff
                div.transition()
                    .duration(200)
                    .style("opacity", 0);
                d3.select(this).style("opacity", 1);
            });

            //Re-add the map key since the svg was cleared
            addKey()
	}

	//Function to zoom in when a country is clicked
	function onClick(d) {
		if (d.id == 'USA') {
			mapScope = 'us';
			updateMap();
		}
	}

//Function to start time lapse from min date to max date
  function startTimeLapseHelper() {
    var inc = (maxTime - minTime) / 10; //TODO: setup an interval option for the user
    var temp = maxTime;
    maxTime = minTime;
    updateMap();
    interval = setInterval(function() {
      if (temp == maxTime || stopTime) {
        clearInterval(interval);
      }
      maxTime += inc;
      updateMap();
    }, 1000);
  }

    //Convert sqlite json to array of state/date pairs formatted for d3's use
    function convertToStateLocDates(all_json) {
        var states = [];
        for (var i = 0; i < all_json.length; i++) {
            var locStr = all_json[i].loc;
            if (locStr) {
                var arr = locStr.split(",");
                for (index = 0; index < arr.length; index++) {
                    element = arr[index].trim()
                    if (stateNameDict[element] != null) {
                        states.push(new locDate(stateNameDict[element],
                            formatDate(all_json[i].date)));
                    }
                }
            }
        }
        return states
    }

    //Retrive the year from the date
    function formatDate(date) {
        if(date) {
            var newDate
            newDate = parseInt(date.substr(6,4))
            return newDate
        }
    }

    //Package for a location and date
    function locDate(loc, date) {
        this.date = date;
        this.loc = loc;
    }

    //Map of any value that could represent a state name
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
