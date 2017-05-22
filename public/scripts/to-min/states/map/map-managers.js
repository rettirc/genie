angular.module('genie.map-managers', [])
.service("MapManager", function($http, d3, MapUtil, MapTimelineManager, MapKeyManager, MapScopeTracker){ // Any modules or services needed for this go in the parens

    //Manager of map vars and functions
    mapManager = function() {
        this.mapDict = {} //location name mapped to current number of people

        this.baseColor = "CFCCF5"; //color for 0 people, gray: "rgb(213,222,217)"
        this.colorGradient = 9; //size of color range

    	this.width = 960; //map dimens
    	this.height = 500;

    	this.overallMaxTime = 2000; //time range displayed min to max, updated by watch
    	this.overallMinTime = 1700;
        this.displayMinTime = this.overallMinTime;
        this.displayMaxTime = this.overallMaxTime;

        this.stopTime = false; //var used to stop time lapse
        this.cumulative = true;
        this.slider;
        this.date_inc;

        this.mapUtil = new MapUtil();
        this.mapScopeTracker = new MapScopeTracker(this)
        this.mapTimelineManager = new MapTimelineManager(this);
        this.mapKeyManager = new MapKeyManager(this);
        var mapManager = this

    	// Define linear scale for output color
        this.color = d3.scaleThreshold()
            .domain(d3.range(0, this.colorGradient))
            .range(["CFCCF5", "B7B2F1", "9F99EC", "877FE8",
                    "6F66E3", "574CDE", "3F33DA", "2719D5", "0F00D1"]);

    	// //Create SVG element and append map to the SVG
    	this.svg = d3.select("#mapView")
			.append("svg")
			.attr("width", this.width)
			.attr("height", this.height);

    	// Append Div to show state name and number of people on mouseover
    	this.div = d3.select("body")
    	    .append("div")
    		.attr("class", "tooltip")
            .style("background-color", "rgb(255,255,255)")
            .style("padding", "5px")
    		    .style("moz-border-radius", "6px")
            .style("border-radius", "6px")
            .style("opacity", 0);

        //Exponential scale for color limits
        this.expScale = d3.scaleLinear()
            .domain(d3.range(0, this.colorGradient))
            .range([1, 10, 25, 50, 90, 100, 150, 200, 500]);



        //Choose what map to display then update it with new global var values
    	this.updateMap = function () {
            this.displayMinTime = this.overallMinTime
            this.displayMaxTime = this.overallMaxTime
            this.stopTime = true
    		this.updateMapWithRange()
    	}

        //Choose what map to display then update it with new global var values
        this.updateMapWithRange = function () {
            this.locations = [];
            var mapManager = this
            //Get locations from sqlite database
            $http.get('api/locations').then(function(all_json, error) {
                if(!error) {
                    mapManager.highlightBD(all_json)
                } else {
                    console.log(error);
                }
            });
        }

        //Update UI with locatins of birth/death based on time of birth/death
    	this.highlightBD = function (locs) {

            //TODO: Change this for other scopes, this is for states
            locs = this.mapUtil.convertToStateLocDates(locs.data)

            var mapPath = this.mapScopeTracker.getMapFilePath()
    		//clear the map dict, may have any set of locations
    		this.mapDict = {}
    		//unpack JSON with state names and geo data for map shape and position
            var mapManager = this
    		d3.json(mapPath, function(loc_json) {
    			//initialize the mapDict
    			for (var j = 0; j < loc_json.features.length; j++)  {
    				mapManager.mapDict[loc_json.features[j].properties.name] = 0
    			}
    			// Loop through each inidivdual data value in the inputted json file
                for (var i = 0; i < locs.length; i++) {
    				//if either piece of data is included, update to dict
    				if (locs[i].date && locs[i].date >= mapManager.displayMinTime
                        && locs[i].date <= mapManager.displayMaxTime) {
    				    mapManager.mapDict[locs[i].loc] += 1;
    				}
    			}
                //update the timeline to reflect the map state
                mapManager.mapTimelineManager.updateTimeline()

                //update the hint if your mouse is over a loc
                var locShowing = mapManager.div.text().split(":")[0]
                locShowing = locShowing.trim()
                mapManager.div.text(locShowing + ": "
                    + mapManager.mapDict[locShowing])

    			//show results on the map
    			mapManager.highlightLocations(loc_json)
    		});
    	}

        //update the map to display the contents of mapDict
        this.highlightLocations = function (location_json) {
    		locationPath = this.mapScopeTracker.getD3LocPath()
            var mapManager = this
    		// Bind the data to the SVG and create one path per GeoJSON feature
    		this.svg.selectAll("*").remove()
    		this.svg.selectAll("path")
    			.data(location_json.features)
    			.enter()
    			.append("path")
    			.attr("d", locationPath)
    			.on("click", this.onClick)
    			.style("stroke", "#fff")
    			.style("stroke-width", "1")
    			.style("fill", function(d) {
    				// Get number of people in this location
    				var value = mapManager.mapDict[d.properties.name];
    				if (value) {
    					//If value exists set the location's color accordingly
    					return mapManager.color(Math.min(mapManager.expScale.invert(value),
                            mapManager.colorGradient));
    				} else {
    					//If value is undefined set the location's color to default
    					return mapManager.baseColor;
    				}
    			})
                .on("mouseover", function(d) {
                    //Show div w/location name and number of people on mouseover
                    mapManager.div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    mapManager.div.text(d.properties.name + ": "
                        + mapManager.mapDict[d.properties.name])
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px")
                        .style("pointer-events", "none");
                    d3.select(this).style("opacity", .8);
                })
                .on("mouseout", function(d) {
                    //Hide div on mouseoff
                    mapManager.div.transition()
                        .duration(200)
                        .style("opacity", 0);
                    d3.select(this).style("opacity", 1);
                });

                //Re-add the map key since the svg was cleared
                this.mapKeyManager.addKey()
                this.mapTimelineManager.addTimeline()
    	}

        //Function to start time lapse from min date to max date
        this.startTimeLapseHelper = function () {
            this.updateMapWithRange(this.displayMinTime, this.displayMinTime);
            var inc = (this.overallMaxTime - this.overallMinTime) / 10; //TODO: setup an interval option for the user
            this.displayMinTime = this.overallMinTime;
            this.displayMaxTime = this.overallMinTime + this.date_inc;
            var mapManager = this
            interval = setInterval(function() {
                if (mapManager.displayMaxTime >= mapManager.overallMaxTime || mapManager.stopTime) {
                    mapManager.displayMaxTime = mapManager.overallMaxTime
                    clearInterval(interval);
                }
                if (!mapManager.cumulative) {
                    mapManager.displayMinTime += inc;
                }
                mapManager.displayMaxTime += inc;
                mapManager.updateMapWithRange(mapManager.displayMinTime, mapManager.displayMaxTime);
            }, 1000);
        }

        //Function to zoom in when a country is clicked
        this.onClick = function (d) {
            console.log(d.id);
    		if (mapManager.mapScopeTracker.pushScope(d.id)) {
    			mapManager.updateMap();
    		}
    	}

        this.initialize = function () {
            this.mapKeyManager.addKey()
            this.mapTimelineManager.addTimeline()
            this.updateMap()
        }
    }

    return mapManager
})

.service("MapTimelineManager", function(d3){ // Any modules or services needed for this go in the parens
    mapTimelineManager = function(mapManager) {
        this.start_marker
        this.finish_marker
        this.timelineLeftPad = 200;

        this.date_scale = d3.scaleLinear()
            .domain([mapManager.overallMinTime, mapManager.overallMaxTime])
            .range([this.timelineLeftPad, mapManager.width/1.3])
            .clamp(true);

        this.updateTimeline = function () {
            this.start_marker.attr("cx", this.date_scale(mapManager.displayMinTime))
            this.finish_marker.attr("cx", this.date_scale(mapManager.displayMaxTime))
        }

        this.addTimeline = function () {
            var moveDown = 470

            this.date_scale = d3.scaleLinear()
                .domain([mapManager.overallMinTime, mapManager.overallMaxTime])
                .range([this.timelineLeftPad, mapManager.width/1.3])
                .clamp(true);

            var slider = mapManager.svg.append("g")
                .attr("class", "slider")
                .attr("transform", "translate(0, " + moveDown + ")");

            slider.append("line")
                .attr("class", "track")
                .attr("x1", this.date_scale.range()[0])
                .attr("x2", this.date_scale.range()[1])
                .attr("style", "stroke: #000; stroke-opacity: 0.3; stroke-width: 10px;  stroke-linecap: round;")
              .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                .attr("class", "track-inset")
                .attr("style", "stroke: #ddd; stroke-width: 8px; stroke-linecap: round;")
              .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
                .attr("class", "track-overlay")
                .attr("style", "stroke-linecap: round; pointer-events: stroke; stroke-width: 50px; stroke: transparent; ")

            slider.insert("g", ".track-overlay")
                .attr("class", "ticks")
                .attr("style", "font: 10px sans-serif;")
                .attr("transform", "translate(0," + 18 + ")")
              .selectAll("text")
              .data(this.date_scale.ticks(10))
              .enter().append("text")
                .attr("x", this.date_scale)
                .attr("text-anchor", "middle")
                .text(function(d) { return d; });

            this.start_marker = slider.insert("circle", ".track-overlay")
                .attr("class", "handle")
                .attr("style", "fill: #fff; stroke: #000; stroke-opacity: 0.5; stroke-width: 1.25px;")
                .attr("r", 9)
                .attr("cx", this.date_scale(mapManager.displayMinTime));

            this.finish_marker = slider.insert("circle", ".track-overlay")
                .attr("class", "handle")
                .attr("style", "fill: #fff; stroke: #000; stroke-opacity: 0.5; stroke-width: 1.25px;")
                .attr("r", 9)
                .attr("cx", this.date_scale(mapManager.displayMaxTime));
        }
    }

    return mapTimelineManager
})



.service("MapKeyManager", function(d3){ // Any modules or services needed for this go in the parens
    mapKeyManager = function(mapManager) {

        this.addKey = function () {
            //Linear scale to translate values to screen x coors
            var key_colors = d3.scaleLinear()
                .domain(d3.range(0, mapManager.colorGradient))
                .rangeRound([545, 575]);

            //create/add the key
            var g = mapManager.svg.append("g")
                .attr("class", "key")
                .attr("transform", "translate(0,30)");

            //Color and space the rectangles of the key
            g.selectAll("rect")
                .data(mapManager.color.range().map(function(d) {
                    d = mapManager.color.invertExtent(d);
                    if (d[0] == null) d[0] = key_colors.domain()[0];
                    if (d[1] == null) d[1] = key_colors.domain()[1];
                    return d;
                }))
                .enter().append("rect")
                .attr("height", 8)
                .attr("x", function(d) { return key_colors(d[0]); })
                .attr("width", function(d) { return key_colors(d[1]) - key_colors(d[0])
                    + (d[1] != mapManager.colorGradient - 1 ? 5 : 1); })
                .style("border-color", function(d) { return mapManager.color(d[0]); })
                .style("fill", function(d) { return mapManager.color(d[0]); });

            //Add key title
            g.append("text")
                .attr("class", "caption")
                .attr("x", key_colors.range()[0])
                .attr("y", -10)
                .attr("fill", "#000")
                .attr("text-anchor", "start")
                .attr("font-weight", "bold")
                .text("Number of People");

            //Add tick labels
            g.call(d3.axisBottom(key_colors)
                .tickSize(13)
                .tickValues(mapManager.color.domain())
                .tickFormat(function(d) {
                    return mapManager.expScale(d);
                }))
              .select(".domain")
                .remove();
        }
    }

    return mapKeyManager;
});
