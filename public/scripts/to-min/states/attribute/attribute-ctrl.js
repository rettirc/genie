angular.module('genie.attribute-ctrl', [])
.controller('AttributeCtrl', function($scope, $http, $state, d3) {
	$scope.go = function(route) {
		$state.go(route);
	}

	var hobbyID = 0;
	var profID = 0;
	$scope.indiData = null;
	$scope.professionSelect = {
		model: 0,
		availableOptions: [
			{ value: 0, name: "Unknown"}
		]
	};
	$scope.educationSelect = {
		model: 0,
		availableOptions: [
			{ value: 0, name: "Unknown"}
		]
	}


	function fetchData(filter) {
		$http.get("/api/people").then(function successCallback(response) {
			if (filter != null) {
				data = [];
				for (var i = 0; i < response.data.length; i++) {
					if (response.data[i].GivenName == filter ||
							response.data[i].Surname == filter) {
						data.push(response.data[i])
					}
				}
				$scope.indiData = data;
			} else {
				$scope.indiData = response.data;
			}
			showPeople();
		}, function errorCallback(response) {
			console.error(response);
		});
		$http.get("/api/attributeData").then(function successCallback(response) {
			if (filter != null) {
				data = [];
				for (var i = 0; i < response.data.length; i++) {
					if (response.data[i].category == filter ||
							response.data[i].education == filter) {
						data.push(response.data[i])
					}
				}
				showAttributes(data)
			} else {
				showAttributes(response.data);
			}
		}, function errorCallback(response) {
			console.error(error);
		})
	}


	function showPeople() {
		if ($scope.indiData === null) {
			throw "Error: Global individual array is null."; //Hopefully won't happen
		}
		// console.log($scope.indiData[0]);
		angular.element(document.querySelector('#individualMenu')).empty();
		var dataDrivenTable = d3.select("#individualMenu").selectAll("tr").data($scope.indiData);
		var rows = dataDrivenTable.enter().append("tr");
		rows.append("td").text(function(d) {
			return d.GivenName;
		});
		rows.append("td").text(function(d) {
			return d.Surname;
		});
		rows.append("td").text(function(d) {
				return d.education;
			});
		rows.append("td").text(function(d) {
				return d.profession;
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
			model: 0,
			availableOptions: [
				// { value: 0, name: "Unknown"}
			]
		};
		professions.forEach(function(d, i) {
			$scope.professionSelect.availableOptions.push({value:d.id, name:d.value});
			if (d.id > profID) {
				profID = d.id + 1;
			}
		});



		var educationLevels = data.filter(function(d) { return d.category == 'education';});
		$scope.educationSelect = {
			model: 0,
			availableOptions: [
				{ value: 0, name: "Unknown"}
			]
		};
		educationLevels.forEach(function(d, i) {
			$scope.educationSelect.availableOptions.push({value:d.id, name:d.value});
		});
	}

	function displayEditData(d) {
		$("#nameDisplay").text(d.GivenName + " " + d.Surname);
		$scope.idir = d.IDIR;
		$("#notesDisplay").text(d.Notes);
		$scope.professionSelect.model = d.professionID;
		$scope.educationSelect.model = d.educationID;
		// console.log($scope.professionSelect);
	}

	$("#filterButton").click(function() {
		var filter = $scope.filter
		fetchData(filter)
	})

	$("#submitButton").click(function() {
		//Get stuff
		let idir = $scope.idir;
		$scope.educationSelect.availableOptions.push({value:hobbyID++, name:$scope.newEdu});
		let newProf = $scope.selectedProf;
		let newEdu = $scope.selectedEducation;
		if (!newProf) {
			newProf = $scope.newProf;
			if (newProf) {
				profID++;
				$http({
					method:"GET",
					url:"/api/uploadNewProfession?profID=" + profID + "&newProf=" + newProf
				}).then(function successCallback(response) {
					console.log(response);
					fetchData(null);
				}, function errorCallback(response) {
					console.log(response);
				});
				newProf = profID;
			}
		}
		if (!newEdu) {
			newEdu = $scope.newEdu;
		}

		$http({
			method:"GET",
			url:"/api/uploadAttribute?idir=" + idir + "&newProf=" + newProf + "&newEdu=" + newEdu
		}).then(function successCallback(response) {
			console.log(response);
			fetchData(null);
		}, function errorCallback(response) {
			console.log(response);
		});
	})

	fetchData(null);

	// TODO: Add functionality to update database
	// TODO: Add filters

});
