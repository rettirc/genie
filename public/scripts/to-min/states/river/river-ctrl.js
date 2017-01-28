angular.module('genie.river-ctrl', [])
.controller('RiverCtrl', function(d3, $scope) {

	var attributeColor = "#aaaaff";
	var depth = 1;
	var familyData = [];

	function checkAttribute(value) {
		var seen = 0; //Count number seen
		d3.selectAll('g').each(
			function(d) {
					d3.select(this).select("rect").classed("selected", false); // Not selected
					for (var attr in d.attributes) {
						if (d.attributes[attr] && d.attributes[attr].toLowerCase() == value) {
								d3.select(this).select("rect").classed('selected', true);

						}
					}
			}
		);
	}

	$scope.$watch('occupationSelected', function(newValue) {
		if(newValue) {
			checkAttribute(newValue.toLowerCase());
		}
	});

	$scope.$watch('hobbySelected', function(newValue) {
		if(newValue) {
			checkAttribute(newValue.toLowerCase());
		}
	});

	$scope.$watch('depthSelected', function(newValue) {
		// checkAttribute(newValue.toLowerCase());
		depth = newValue;
		drawFamilyMembers();
	});

	$scope.$watch('colorSelected', function(newValue) {
		// checkAttribute(newValue.toLowerCase());
		attributeColor = newValue;
	});

	// Setup zoom and pan
	var zoom = d3.behavior.zoom()
		.scaleExtent([.1,1])
		.on('zoom', function(){
			svg.attr("transform", d3.event.transform);
		});
		// Offset so that first pan and zoom does not jump back to the origin


	var svg = d3.select("#riverView").append("svg") // The page currently has no svg element. Fix this
		.attr("width", 800)
		.attr("height", 600) // Arbitrary size
		.call(zoom);
		//TODO: Make the size dynamic

	d3.json("data/river-view-test.json", function(error, json) { // The data is physically in this file as JSON
		if(error) {
			return console.error(error);
		}
		familyData = json;
		drawFamilyMembers(depth); // Call the method to draw family members
		// jsonData = json;
	});

	function xLocation(dx) {
		return 400 + (dx * 75); // Put this in a function -- later use d3 scaling??
	}

	function yLocation(birthYear) {
		return (birthYear - 1920) * 5 ; // Put this in a function as well -- later use birth year?
	}

	function capitalizeAttribute(string) {
		return string[0].toUpperCase() + string.slice(1);
	}

	function displayPersonalData() { // Helper method to display personal data

		var group = d3.selectAll("g").each(
			function(d) {
				var attributes = Object.keys(d.attributes);
				for (var i = 0; i < attributes.length; i++) {
					d3.select(this).append("text")
					.classed("info",true)
					.attr("x", xLocation(d.dx) + 5)
					.attr("y", yLocation(d.birthYear) + (i + 1) * 30 - 15)
					.text(capitalizeAttribute(attributes[i]));

					d3.select(this).append("text")
					.classed("info",true)
					.attr("x", xLocation(d.dx) + 5)
					.attr("y", yLocation(d.birthYear) + (i + 1) * 30)
					.text(capitalizeAttribute(d.attributes[attributes[i]]));
				}
			}
		);

	}

	function drawFamilyMembers() {
		var data = familyData[0];
		var curDepth = 1;
		while (curDepth < depth && familyData[curDepth]) {
			data = data.concat(familyData[curDepth++]);
		}

		var node = svg.selectAll("g") // Group NEEDED I learned the hard way
		.data(data); // bind data

		node.selectAll("text.info").remove();

		var personNode = node.enter() // Userd for new data TODO: Make update and exit procedures
		.append("g"); // Because we're using enter, add a group

		personNode.append("rect") // Add a rectangle to the group
		.attr("y", function(d) { // Y is based on ID: TODO: Make based on year
			return yLocation(d.birthYear) - 20;
		})
		.attr("x", function(d,i) { // X based on position in the list
			return xLocation(d.dx);
		})
		.attr("width", 100) // Width 100. TODO: Make dynamic by size of text
		.attr("height", function(d) { // Height is based on number of attributes in person object
			return 100;
		});

		personNode
		.append("text") // Add their name to the group
		.attr("text-anchor", "start")
		.attr('class', 'name')
		.attr("x", function(d, i) { // Similar procedure as before
			return xLocation(d.dx) + 5;
		})
		.attr("y", function(d) {
			return yLocation(d.birthYear);
		})
		.attr("font-size", "14") // But bigger text
		.text(function(d, i) {
			return d.firstName + " " + d.lastName;
		})
		.style('fill-opacity', 1);

		displayPersonalData();

		node.exit().remove(); // Get rid of ones we don't want

	}


});
