angular.module('genie.river-ctrl', [])
.controller('RiverCtrl', function(d3, $scope) {

	// Setup zoom and pan
	var zoom = d3.behavior.zoom()
		.scaleExtent([.1,1])
		.on('zoom', function(){
			svg.attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
		})
		// Offset so that first pan and zoom does not jump back to the origin
		.translate([400, 200]);

	var svg = d3.select("#riverView").append("svg") // The page currently has no svg element. Fix this
		.attr("width", 800)
		.attr("height", 600) // Arbitrary size
		.call(zoom);
		//TODO: Make the size dynamic

	d3.json("data/river-view-test.json", function(error, json) { // The data is physically in this file as JSON
		if(error) {
			return console.error(error);
		}
		drawFamilyMembers(json[0].concat(json[1])); // Call the method to draw family members
	});

	function xLocation(dx) {
		return 400 + (dx * 75); // Put this in a function -- later use d3 scaling??
	}

	function yLocation(birthYear) {
		return (birthYear - 1920) * 5 ; // Put this in a function as well -- later use birth year?
	}

	function displayPersonalData(group, data, index) { // Helper method to display personal data
		var attributes = Object.keys(data); // TODO: Remove firstName, lastName, id etc
		for (var i = 0; i < attributes.length; i++) {
			group.append("text") // Add on more text
			.attr("y", yLocation(data.birthYear) + (i + 1) * 10)
			.attr("x", xLocation(data.dx)) // Make space for new lines
			.attr("font-size", "10") // Font size
			.text(attributes[i] + ": " + data[attributes[i]]); // Physical text. TODO: Make more interesting and less JSONy
		}
	}

	function drawFamilyMembers(data) {
		var personNode = svg.selectAll("g") // Group NEEDED I learned the hard way
		.data(data) // bind data
		.enter() // Userd for new data TODO: Make update and exit procedures
		.append("g") // Because we're using enter, add a group

		personNode.append("rect") // Add a rectangle to the group
		.attr("y", function(d) { // Y is based on ID: TODO: Make based on year
			return yLocation(d.birthYear) - 20;
		})
		.attr("x", function(d,i) { // X based on position in the list
			return xLocation(d.dx);
		})
		.attr("width", 100) // Width 100. TODO: Make dynamic by size of text
		.attr("height", function(d) { // Height is based on number of attributes in person object
			return Object.keys(d).length * 30;
		})
		.style("fill", "#dddddd"); // Background is a boring shade of gray, for now

		personNode
		.append("text") // Add their name to the group
		.attr("text-anchor", "start")
		.attr('class', 'name')
		.attr("x", function(d, i) { // Similar procedure as before
			return xLocation(d.dx);
		})
		.attr("y", function(d) {
			return yLocation(d.birthYear);
		})
		.attr("font-size", "14") // But bigger text
		.text(function(d, i) {
			displayPersonalData(personNode, d, i);
			return d.firstName + " " + d.lastName;
		})
		.style('fill-opacity', 1);

	}


});