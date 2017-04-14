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
		var professions = data.filter(function(d) { return d.category == 'profession';});
		$scope.professionSelect = {
			model: 'professions',
			availableOptions: []
		}
		professions.forEach(function(d, i) {
			$scope.professionSelect.availableOptions.push({value:d.id, name:d.value});
		});


		var hobbies = data.filter(function(d) { return d.category == 'hobby';});
		$scope.hobbySelect = {
			model: 'hobby',
			availableOptions: []
		}
		hobbies.forEach(function(d, i) {
			$scope.hobbySelect.availableOptions.push({value:d.id, name:d.value});
		});
	}

	function displayEditData(d) {
		$("#nameDisplay").text(d.GivenName + " " + d.Surname);
		$scope.idir = d.IDIR;
		$("#notesDisplay").text(d.Notes);
		if (d.PROFESSION) {
			$("#professionSelect").val(d.PROFESSION);
			$scope.profession = d.PROFESSION;
		} else {
			$("#professionSelect").val("Unknown");
			$scope.profession = 0;
		}
	}

	$("#submitButton").click(function() {
		//Get stuff
		let idir = $scope.idir;
		// let newProf = $scope.professionSelect.model;
		// let newHobby = $scope.hobbySelect.model;
		// console.log(newProf, newHobby);

		// $http({
		// 	method:"GET",
		// 	url:"/api/uploadAttribute?idir=" + idir + "&newProf=" + newProf + "&newHobby=" + newHobby
		// }).then(function successCallback(response) {
		// 	console.log(response);
		// }, function errorCallback(response) {
		// 	console.log(response);
		// });
	})

	fetchData();

	// TODO: Add functionality to update database
	// TODO: Add filters

});
