angular.module('genie.map-ctrl', [])
.controller('MapCtrl', function($scope, d3, $http, MapManager) {
    //Initialize scope variables used in UI and watched by controller
	$scope.newTimeMin = {
		value: 1700
	};

	$scope.newTimeMax = {
		value: 2000
	};

    $scope.newTimeInc = {
		value: 100
	};

	$scope.mapScope = {
		value: "us"
	};

    $scope.newTimeInc = {
        value: 100
    };

	$scope.mapScopeData = {
		model: 'us',
		availableOptions: [
        	{
				value: 'us',
				name: 'US'
			},
        	{
				value: 'globe',
				name: 'Globe'
			}
    	]
	}

	//Called when value minTime is changed to show travel past that date
	$scope.$watch('newTimeMin.value', function(newValue) {
        if (initializing < 3) {
            initializing++;
        } else {
            if(newValue) {
                mapManager.overallMinTime = newValue;
                mapManager.updateMap();
            }
        }
	});

	//Called when value maxTime field is changed to show travel past that date
	$scope.$watch('newTimeMax.value', function(newValue) {
        if (initializing < 3) {
            initializing++;
        } else {
            if(newValue) {
                mapManager.overallMaxTime = newValue;
                mapManager.updateMap();
    		}
        }
	});

	$scope.$watch('newTimeInc.value', function(newValue) {
        mapManager.date_inc = newValue
	});

	//Called when zoom out button is pressed; zooms to the last map on the stack
	$scope.zoomOut = function() {
		mapManager.mapScope = mapManager.prevView.pop();
		mapManager.updateMap()
	}

    //Called when the start button is pressed for the time lapse
    $scope.startTimeLapse = function() {
        mapManager.stopTime = false;
        mapManager.startTimeLapseHelper();
    }

    //Called to stop the time lapse
    //TODO: change this up so that it is a pause that can then resume
    $scope.stopTimeLapse = function() {
        mapManager.stopTime = true;
    }

    $scope.resetMap = function() {
        mapManager.stopTime = true;
        mapManager.updateMap()
    }

	// Called when value mapType is changed to show travel past that date
	$scope.$watch('mapTypeData.model', function(newValue) {
        if (initializing < 3) {
            initializing++;
        } else {
            if(newValue) {
    			mapManager.mapType = newValue
    			mapManager.updateMap()
    		}
        }
	});

    $scope.showDateFrame = function() {
        toggleDateFrame(true)
    }

    $scope.hideDateFrame = function() {
        toggleDateFrame(false)
    }

    function toggleDateFrame(showDateFrame) {
        var frameOptions = document.getElementById('dateFrameOptions');
        mapManager.stopTime = true
        if (showDateFrame) {
            frameOptions.style.display = 'block';
            mapManager.displayMaxTime = mapManager.overallMinTime + mapManager.date_inc
            mapManager.cumulative = false
        } else {
            frameOptions.style.display = 'none';
            mapManager.displayMaxTime = mapManager.overallMaxTime
            mapManager.cumulative = true
        }
        mapManager.mapTimelineManager.updateTimeline()
    }

    function displayDateRange(display) {
        var minDateDiv = document.getElementById('minDateDiv');
        var maxDateDiv = document.getElementById('maxDateDiv');
        if (display) {
            minDateDiv.style.display = 'block';
            maxDateDiv.style.display = 'block';
        } else {
            minDateDiv.style.display = 'none';
            maxDateDiv.style.display = 'none';
        }
    }

    var initializing = 0 //var used to track/avoid 3 initial reloads
    var mapManager = new MapManager()
    //Initiallize the view
    mapManager.initialize()

    // function toggleDateDisplay() {
    //     displayDateRange(!dateRangeNotIncrement)
    // }
});
