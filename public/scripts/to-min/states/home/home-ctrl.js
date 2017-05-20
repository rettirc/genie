angular.module('genie.home-ctrl', []) // Hiya
.controller('HomeCtrl', function($scope, $state, testModule) { // I'm listing testModule as a dependency
	$scope.hello = 'hello';
	console.log(testModule("Cody")); // testModule is now what the factory for testModule returned!
	// It was a function, so in this scope, testModule is the function I returned in moduleTest for the factory
	// It does it's jazz and returns what it needs to returns
	$scope.go = function(route) {
		$state.go(route);
	}
});
/* Bada Bing, Bada Boom */
// If you don't know what I"m talking about, this is the annotations for a group member who is currently in Seattle
