angular.module('genie.branch-ctrl', [])
.controller('BranchCtrl', function($scope, $http, $window, d3) {

	var attributeColor = "#aaaaff";
	var depth = 1;
	var familyData = [];

	function checkAttribute(attribute, value) {
		var seen = 0; //Count number seen
		var matchingData = seenAttributes[value];
		if (matchingData) {
			for (var i = 0; i < matchingData.length; i++) {
				var selectedNode = matchingData[i];
				d3.selectAll("g.nodes svg").classed("selected-" + attribute + '-enabled', function(d) {
					return d.attributes[attribute] === value;
				})
					.classed('selected-' + attribute + '-disabled', false);
			}
		} else {
			d3.selectAll("g.nodes svg")
				.classed('selected-' + attribute + '-enabled', false)
				.classed('selected-' + attribute + '-disabled', false);

		}
	}
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

	$scope.riverScope = {
		model: 'relational',
		availableOptions: [
        	{
				value: 'relational',
				name: 'Family Connections'
			},
        	{
				value: 'personal',
				name: 'Personal Connections'
			}
    	]
	}

	$scope.hobbySelected = {
		model: '',
		enabled: false
	}

	$scope.occupationSelected = {
		model: '',
		enabled: false
	}

	$scope.depthSelected = 3;

	$scope.$watch('depthSelected', function(newValue) {
		gatherData($scope.depthSelected);
	});

	$scope.$watch('riverScope.model', function(newValue) {
		d3.selectAll('#riverView svg g').each(function(d) { d3.select(this).remove(); });
		// gatherData($scope.depthSelected);
		// d3.json("data/river-force-test.json", function(error,json) { displayData(error,json, newValue); });
	})

	$scope.$watch('hobbySelected.model', function(newValue) {
		if(newValue) {
			checkAttribute('hobby', newValue.toLowerCase());
			$scope.hobbySelected.enabled = true;
		} else {
			$scope.hobbySelected.enabled = false;
		}
	});

	$scope.$watch('hobbySelected.enabled', function(newValue) {
		if (!newValue) {
			d3.selectAll("svg.selected-hobby-enabled")
				.classed('selected-hobby-enabled', false)
				.classed('selected-hobby-disabled', true);
		} else {
			d3.selectAll("svg.selected-hobby-disabled")
				.classed('selected-hobby-enabled', true)
				.classed('selected-hobby-disabled', false);
		}
	});

	$scope.$watch('occupationSelected.model', function(newValue) {
		if(newValue) {
			checkAttribute('profession', newValue.toLowerCase());
			$scope.occupationSelected.enabled = true;
		} else {
			$scope.occupationSelected.enabled = false;
		}
	});

	$scope.$watch('occupationSelected.enabled', function(newValue) {
		if (!newValue) {
			d3.selectAll("svg.selected-profession-enabled")
				.classed('selected-profession-enabled', false)
				.classed('selected-profession-disabled', true);
		} else {
			d3.selectAll("svg.selected-profession-disabled")
				.classed('selected-profession-enabled', true)
				.classed('selected-profession-disabled', false);
		}
	});

	$scope.$watch(function() {return $window.innerWidth;}, function(newValue) {
		width = document.getElementById("riverView").clientWidth;
		forceCenter.x(width / 2);
		d3.select("#bg")
			.attr("width", width);
	})

	var svg = d3.select("#riverView").append("svg") // The page currently has no svg element. Fix this
		.attr("width", '100%')
		.attr("height", 800); // Arbitrary size

	svg.append("rect")
		.attr("id", "bg")
		.classed("bg", true)
		.attr("width", width)
		.attr("height", 800);

	svg.append("defs").append("marker")
		.attr("id", "arrow")
		.attr("markerWidth", 10)
		.attr("markerHeight", 10)
		.attr("refX", 0)
		.attr("refY", 3)
		.attr("orient", "auto")
		.attr("markerUnits", "strokeWidth")
		.append("path")
		.attr("d", "M0,0 L0,6 L6,3 z");

	// var width = document.getElementById("riverView").width;
	// var height = document.getElementById("riverView").height;

	var width = 1000;
	var height = $("#riverView svg").height();

	var forceCenter = d3.forceCenter(width / 2, height / 2);

	var simulation = d3.forceSimulation()
		.force("link", d3.forceLink().id(function(d) {
			return d.IDIR;
		}))
		.force("collide", d3.forceCollide().radius(90).iterations(2))
		// .force("charge", d3.forceManyBody().strength())
		.force("center", forceCenter);

	function displayData(nodes, links, linkMode) { // The data is physically in this file as JSON

		// var connectionList = processConnections(json);

		var linkingData = links;
		// var connectionData = connectionList;

		// if (linkMode == 'personal') {
		// 	var linkingData = connectionList;
		// 	var connectionData = json.links;
		// }

		// var connections = svg.append("g")
		// 	.classed("connections", true)
		// 	.selectAll("path")
		// 	.data(connectionData)
		// 	.enter()
		// 	.append("path");

		var link = svg.append("g")
			.classed("links", true)
			.selectAll("line")
			.data(linkingData)
			.enter()
			.append("line")
			.attr("marker-end", linkMode != 'personal' ? "url(#arrow)" : null);


		var node = svg.append("g")
			.classed("nodes", true)
			.selectAll("g.node")
			.data(nodes)
			.enter()
			.append("svg")
			.classed("node", true)
			.attr("idir", function(d) { return d.IDIR; })
			.attr("x", 0)
			.attr("y", 0)
			.attr("vizId", function(d) { return d.id; })
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
		simulation.nodes(nodes).on("tick", ticked);
		simulation.force("link").links(linkingData);

		var targetDist = (linkMode == 'personal') ? 50 : 65;

		function ticked() {

			// connections.attr("d", function(d) {
			// 	var n1 = json.nodes[d.source];
			// 	var n2 = json.nodes[d.target];
			// 	return "M" + n1.x + " " + n1.y + " Q " + n2.x + " " + n1.y + " " + n2.x + " " + n2.y; // Quadratic Bessier Curve
			// });

			link.attr("x1", function(d) {
					var theta = Math.atan2(d.source.y - d.target.y, d.target.x - d.source.x);
					return d.source.x + 50 * (Math.abs(Math.abs(theta) - Math.PI / 2) <= Math.PI / 4 ? 1 / Math.tan(Math.abs(theta)) : (Math.abs(theta) > Math.PI / 2 ? -1 : 1));
				})
				.attr("y1",  function(d) {
						var theta = Math.atan2(d.source.y - d.target.y, d.target.x - d.source.x);
						return d.source.y - 50 * (Math.abs(Math.abs(theta) - Math.PI / 2) <= Math.PI / 4 ? (theta > 0 ? 1 : -1) : (Math.abs(theta) < Math.PI / 2 ? 1 : -1) * Math.tan(theta));
				})
				.attr("x2",  function(d) {
						var theta = Math.atan2(d.source.y - d.target.y, d.target.x - d.source.x);
						return d.target.x - targetDist * (Math.abs(Math.abs(theta) - Math.PI / 2) <= Math.PI / 4 ? 1/Math.tan(Math.abs(theta)) : (Math.abs(theta) > Math.PI / 2 ? -1 : 1));
					})
				.attr("y2",  function(d) {
						var theta = Math.atan2(d.source.y - d.target.y, d.target.x - d.source.x);
						return d.target.y + targetDist * (Math.abs(Math.abs(theta) - Math.PI / 2) <= Math.PI / 4 ? (theta > 0 ? 1 : -1) : (Math.abs(theta) < Math.PI / 2 ? 1 : -1) * Math.tan(theta));
					});

			node.attr("x", function(d) { return d.x - 50; })
				.attr("y", function(d) { return d.y - 50; });

		}

		simulation.alpha(1).restart();

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

	function parseDate(dateString) {
		return dateString.toString().substring(0, 4);
	}

	function displayPersonalData(nodes) { // Helper method to display personal data

		nodes.each(
			function(d) {
				var descriptionLines = [];
				var name = d.GivenName.split(" ");
				descriptionLines.push(name[0]);
				descriptionLines.push(d.Surname);
				descriptionLines.push(parseDate(d.birth));
				var group = d3.select(this);
				// group.append("text")
				// 	.attr("x", 5)
				// 	.attr("y", 15)
				// 	.text(function(d) { return d.GivenName; });
				//
				// group.append("text")
				// 	.attr("x", 5)
				// 	.attr("y", 30)
				// 	.text(function(d) { return d.Surname; });
				for (var i = 0; i < descriptionLines.length; i++) {
					group.append("text")
					.classed("info",true)
					.attr("x", 5)
					.attr("y", (i + 1) * 20)
					.text(descriptionLines[i]);

				// 	d3.select(this).append("text")
				// 	.classed("info",true)
				// 	.attr("x", 5)
				// 	.attr("y", (i + 1) * 30 + 15)
				// 	.text(capitalizeAttribute(d.attributes[attributes[i]]));
				}
			}
		);

	}

	var seenAttributes = {}; // Usefull for attributes

	function processConnections(data) {
		var nodes = data.nodes;
		seenAttributes = {};
		for (var person of nodes) {
			for (var attr in person.attributes) {
				if (person.attributes.hasOwnProperty(attr)) {
					if (seenAttributes[person.attributes[attr]]) {
						seenAttributes[person.attributes[attr]].push(person.id);
					} else {
						seenAttributes[person.attributes[attr]] = [person.id];
					}
				}
			}
		}

		var interestingLinks = Object.keys(seenAttributes).map(function(key) { return seenAttributes[key] ;} ).filter(function(list) { return list.length > 1;});

		// console.log(interestingLinks);

		var outputLinks = [];
		for (var k = 0, interestingLink = interestingLinks[k]; k < interestingLinks.length; interestingLink = interestingLinks[++k]) {
			for (var i = 0; i < interestingLink.length - 1; i++) {
				for (var j = i + 1; j < interestingLink.length; j++) {
					outputLinks.push({source:interestingLink[i], target:interestingLink[j]});
				}
			}
		}
		return outputLinks;

	}

	function gatherData(depth) {
		d3.selectAll('#riverView svg g').each(function(d) { d3.select(this).remove(); });
		$http({
			method:"GET",
			url:"/api/relations?depth=3"
		}).then(function successCallback(response) {
			let rows = response.data.rows;
			let idirToIndex = response.data.lookup;
			dfs(353, rows, idirToIndex, depth);
			let seenPeople = rows.filter(function(d) { return d.seen; });
			let links = [];
			for (let i = 0; i < seenPeople.length; i++) {
				let p = seenPeople[i];
				for (let j = 0; j < p.children.length; j++) {
					if(rows[idirToIndex[p.children[j]]].seen) {
						links.push({"source":p.IDIR, "target":p.children[j]});
					}
				}
			}
			displayData(seenPeople, links, "familial");
		}, function errorCallback(response) {
			console.log(response);
		});
	}

	function dfs(idir, rows, idirToIndex, depth) {
		let p = rows[idirToIndex[idir]];
		p.seen = true;
		if (depth == 0) {
			return;
		}
		if (p.mother && !rows[idirToIndex[p.mother]].seen) {
			dfs(p.mother, rows, idirToIndex, depth - 1);
		}
		if (p.father && !rows[idirToIndex[p.father]].seen) {
			dfs(p.father, rows, idirToIndex, depth - 1);
		}
		for (var i = 0; i < p.children.length; i++) {
			if (!rows[idirToIndex[p.children[i]]].seen) {
				dfs(p.children[i], rows, idirToIndex, depth - 1);
			}
		}
	}

	// d3.json("data/river-force-test.json", function(error,json) { displayData(error,json, 'familial'); });
	// $http.post('/db', { mode: 'query', base: '1000', depth: 5}).then(function (response) { console.log(response.data); }, function(error) { console.error(error) } );


});
