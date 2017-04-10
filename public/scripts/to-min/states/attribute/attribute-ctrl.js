angular.module('genie.attribute-ctrl', [])
.controller('AttributeCtrl', function($scope, $http, $state, d3) {
	$scope.go = function(route) {
		$state.go(route);
	}

	$scope.indiData = null;

	function fetchData() {
		$http.get("/api/people").then(function successCallback(response) {
			$scope.indiData = response.data;
			showPeople();
		}, function errorCallback(response) {
			console.error(response);
		});
		$http.get("/api/attributeData").then(function successCallback(response) {
			showAttributes(response.data);
		}, function errorCallback(response) {
			console.error(error);
		})
	}


	function showPeople() {
		if ($scope.indiData === null) {
			throw "Error: Global individual array is null."; //Hopefully won't happen
		}
		var dataDrivenTable = d3.select("#individualMenu").selectAll("tr").data($scope.indiData);
		var rows = dataDrivenTable.enter()
			.append("tr");
		rows.append("td")
			.text(function(d) { return d.GivenName; });
		rows.append("td")
			.text(function(d) { return d.Surname; });
		rows.append("td")
			.text(function(d) {
				return d.PROFESSION;
			});
		rows.on("click", function(d) {
			d3.select("tr.info").classed("info", false);
			d3.select(this).classed("info", true);
			displayEditData(d);
		})
	}

	function showAttributes(data) {
		console.log(data);
		var professions = d3.select("#professionSelect").selectAll("option");
		professions.data(data/*.filter(function(d) { return d.PROFESSIONID !== null; })*/);
		professions.enter()
			.append("option")
			.text(function(d) { return d.VALUE; });
	}

	function displayEditData(d) {
		$("#nameDisplay").text(d.GivenName + " " + d.Surname);
		$("#notesDisplay").text(d.Notes);
		$("#professionSelect").val(d.PROFESSION);
	}

	fetchData();

	// TODO: Fetch Professions and Hobbies from Database
	// TODO: Add functionality to update database
	// TODO: Add filters

	// $("#submitButton").on("click", function() { $scope.go("layout.upload")});
});
