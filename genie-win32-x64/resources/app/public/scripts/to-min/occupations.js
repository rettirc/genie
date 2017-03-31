angular.module('genie.occupations', [])
.factory("Occupations", function(){
	var occupations = [
		"Teacher",
		"Blacksmith",
		"Wordsmith",
		"Milliner",
		"Barber"
	];

	return occupations;

});
