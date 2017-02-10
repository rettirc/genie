angular.module('genie.river-ctrl', [])
.controller('RiverCtrl', function($scope, d3) {

	var attributeColor = "#aaaaff";
	var depth = 1;
	var familyData = [];

	// function checkAttribute(attribute, value) {
	// 	var seen = 0; //Count number seen
	// 	d3.selectAll('g').each(
	// 		function(d) {
	// 				d3.select(this).select("rect").classed("selected", false); // Not selected
	// 				for (var attr in d.attributes) {
	// 					if (attr == attribute && d.attributes[attr] && d.attributes[attr].toLowerCase() == value) {
	// 							d3.select(this).select("rect").classed('selected', true);
	// 							seen++;
	// 					}
	// 				}
	// 		}
	// 	);
	// 	if (seen > 1) {
	// 		drawLink();
	// 	}
	// }

	// function drawLink() {
	// 	var selectedNodes = d3.selectAll('rect.selected');
	//
	// 	selectedNodes.style("fill", attributeColor)
	// 	.on("click", function() {
	// 		removeLink(selectedNodes);
	// 	});
	// }

	// function removeLink(selectedNodes) {
	// 	selectedNodes.attr("style", null)
	// 	.on("click", null);
	// }

	// $scope.$watch('occupationSelected', function(newValue) {
	// 	if(newValue) {
	// 		checkAttribute('profession', newValue.toLowerCase());
	// 	}
	// });
	//
	// $scope.$watch('hobbySelected', function(newValue) {
	// 	if(newValue) {
	// 		checkAttribute('hobby', newValue.toLowerCase());
	// 	}
	// });
	//
	// $scope.$watch('depthSelected', function(newValue) {
		// checkAttribute(newValue.toLowerCase());
		// depth = newValue;
		// drawFamilyMembers();
	// });
	//
	// $scope.$watch('colorSelected', function(newValue) {
	// 	// checkAttribute(newValue.toLowerCase());
	// 	attributeColor = newValue;
	// });


	var svg = d3.select("#riverView").append("svg") // The page currently has no svg element. Fix this
		.attr("width", "100%")
		.attr("height", 600); // Arbitrary size

	var width = $("#riverView").width();
	var height = $("#riverView").height();


	var simulation = d3.forceSimulation()
		.force("link", d3.forceLink().id(function(d) {
			return d.id
		}))
		.force("collide", d3.forceCollide().radius(75).iterations(2))
		.force("charge", d3.forceManyBody())
		.force("center", d3.forceCenter(width / 2, height / 2));

	var displayData = function(error, json) { // The data is physically in this file as JSON
		if(error) {
			return console.error(error);
		}
		var link = svg.append("g")
			.classed("links", true)
			.selectAll("line")
			.data(json.links)
			.enter()
			.append("line")
			.attr("stroke-width", 2)
			.attr("stroke", "black");


		var node = svg.append("g")
			.classed("nodes", true)
			.selectAll("g.node")
			.data(json.nodes)
			.enter()
			.append("svg")
			.classed("node", true)
			.attr("x", 0)
			.attr("y", 0)
			.call(d3.drag()
					.on("start", dragstarted)
					.on("drag", dragged)
					.on("end", dragended));

		node.append("rect")
			.attr("width", 100)
			.attr("height",100)
			.attr("fill", "steelblue")
			.attr("x", 0)
			.attr("y", 0);

		node.call(displayPersonalData);

		node.append("title").text(function(d) { return d.firstName });
		// displayPersonalData();
		simulation.nodes(json.nodes).on("tick", ticked);
		simulation.force("link").links(json.links);

		function ticked() {
			link.attr("x1", function(d) {
					var theta = Math.atan2(d.source.y - d.target.y, d.target.x - d.source.x);
					return d.source.x + 60 * (Math.abs(Math.abs(theta) - Math.PI / 2) <= Math.PI / 4 ? 1 / Math.tan(Math.abs(theta)) : (Math.abs(theta) > Math.PI / 2 ? -1 : 1));
				})
				.attr("y1",  function(d) {
						var theta = Math.atan2(d.source.y - d.target.y, d.target.x - d.source.x);
						return d.source.y - 60 * (Math.abs(Math.abs(theta) - Math.PI / 2) <= Math.PI / 4 ? (theta > 0 ? 1 : -1) : (Math.abs(theta) < Math.PI / 2 ? 1 : -1) * Math.tan(theta));
				})
				.attr("x2",  function(d) {
						var theta = Math.atan2(d.source.y - d.target.y, d.target.x - d.source.x);
						return d.target.x - 60 * (Math.abs(Math.abs(theta) - Math.PI / 2) <= Math.PI / 4 ? 1/Math.tan(Math.abs(theta)) : (Math.abs(theta) > Math.PI / 2 ? -1 : 1));
					})
				.attr("y2",  function(d) {
						var theta = Math.atan2(d.source.y - d.target.y, d.target.x - d.source.x);
						return d.target.y + 60 * (Math.abs(Math.abs(theta) - Math.PI / 2) <= Math.PI / 4 ? (theta > 0 ? 1 : -1) : (Math.abs(theta) < Math.PI / 2 ? 1 : -1) * Math.tan(theta));
					});

			node.attr("x", function(d) { return d.x - 50; })
				.attr("y", function(d) { return d.y - 50; });

		}

	};

	function dragstarted(d) {
	  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
	  d.fx = d.x;
	  d.fy = d.y;
	}

	function dragged(d) {
	  d.fx = d3.event.x;
	  d.fy = d3.event.y;
	}

	function dragended(d) {
	  if (!d3.event.active) simulation.alphaTarget(0);
	  d.fx = null;
	  d.fy = null;
	}

	function capitalizeAttribute(string) {
		return string[0].toUpperCase() + string.slice(1);
	}

	function displayPersonalData(nodes) { // Helper method to display personal data

		nodes.each(
			function(d) {
				var attributes = Object.keys(d.attributes);
				var group = d3.select(this);
				group.append("text")
					.attr("x", 5)
					.attr("y", 15)
					.text(function(d) {return d.firstName + " " + d.lastName});
				for (var i = 0; i < attributes.length; i++) {
					group.append("text")
					.classed("info",true)
					.attr("x", 5)
					.attr("y", (i + 1) * 30)
					.text(capitalizeAttribute(attributes[i]));

					d3.select(this).append("text")
					.classed("info",true)
					.attr("x", 5)
					.attr("y", (i + 1) * 30 + 15)
					.text(capitalizeAttribute(d.attributes[attributes[i]]));
				}
			}
		);

	}

	d3.json("data/river-force-test.json", function(error,json) { displayData(error,json); })


});
