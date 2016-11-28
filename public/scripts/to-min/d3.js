angular.module('genie.d3', [])
.factory('d3', function($window) {
	if(!$window.d3){
		console.log('not here yet!');

		// If lodash is not available you can now provide a
		// mock service, try to load it from somewhere else,
		// redirect the user to a dedicated error page, ...
	}
	return $window.d3;
});
