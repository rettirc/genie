angular.module('genie.moduleTest', []) // Make a module to register a service to
.factory("testModule", function(){ // Any modules or services needed for this go in the parens
  // Here's the service. I'm *technically* providing a Factory
  //that is lazily instantiated
	var staticData = [ // Static data if you need it
		"One Potato",
		"Two Potato",
		"Three Potato",
		"Four" // Etc, ad nauseum
	];

  function testFunction(name) { // My export function :D
    console.log("Hiya, " + name); // I can use inputs
    return "Thanks"; // I can return something
  }

	return testFunction; // Return this function and it will be my service
  // TO SEE THIS IN ACTION, Go to home-ctrl.js

});
