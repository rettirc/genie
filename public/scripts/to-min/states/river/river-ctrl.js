angular.module('genie.river-ctrl', [])
.controller('RiverCtrl', function(d3, $scope) {
	$scope.hello = 'hello';
	var svg = d3.select("#riverView").append("svg")
		.attr("width", 800)
		.attr("height", 600);

	d3.json("data/river-view-test.json", function(error, json) {
		if(error) {
			return console.error(error);
		}
		drawFamilyMembers(json);
	});

	function drawFamilyMembers(data) {
		svg.selectAll("rect")
		.data(data)
		.enter()
		.append("rect")
		.attr("y", function(d) {
			return d.id * 100;
		})
		.attr("x", function(d,i) {
			return i * 100;
		})
		.attr("width", 100)
		.attr("height", 100)
		.style("fill", "black");
	}


});
