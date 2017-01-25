angular.module('genie.river-ctrl', [])
.controller('RiverCtrl', function(d3, $scope) {

	var svg = d3.select("#riverView").append("svg") // The page currently has no svg element. Fix this
		.attr("width", 800)
		.attr("height", 600); // Arbitrary size
		//TODO: Make the size dynamic

	d3.json("data/river-view-test.json", function(error, json) { // The data is physically in this file as JSON
		if(error) {
			return console.error(error);
		}
		drawFamilyMembers(json); // Call the method to draw family members
	});

	function xLocation(index) {
		return index * 100; // Put this in a function -- later use d3 scaling??
	}

	function yLocation(id) {
		return id * 100; // Put this in a function as well -- later use birth year?
	}

	function displayPersonalData(group, data, index) { // Helper method to display personal data
		var attributes = Object.keys(data); // TODO: Remove firstName, lastName, id etc
		for (var i = 0; i < attributes.length; i++) {
			group.append("text") // Add on more text
			.attr("x", yLocation(index))
			.attr("y", xLocation(data.id) + (i + 1) * 10) // Make space for new lines
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
			return yLocation(d.id) - 20;
		})
		.attr("x", function(d,i) { // X based on position in the list
			return xLocation(i);
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
			return xLocation(i);
		})
		.attr("y", function(d) {
			return yLocation(d.id);
		})
		.attr("font-size", "14") // But bigger text
		.text(function(d, i) {
			displayPersonalData(personNode, d, i);
			return d.firstName + " " + d.lastName;
		})
		.style('fill-opacity', 1);

	}


});
