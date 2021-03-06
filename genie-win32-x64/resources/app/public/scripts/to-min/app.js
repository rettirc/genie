angular.module('genie', [
	'ui.bootstrap',
	'ui.router',

	'genie.state-config',
	'genie.templates',

	'genie.layout-ctrl',
	'genie.auth-ctrl',
	'genie.home-ctrl',
	'genie.testing',
	'genie.d3',
	'genie.occupations',
	'genie.nav-ctrl',
    'genie.river-ctrl',
    'genie.detail-ctrl',
	'genie.map-ctrl',
	'genie.upload-ctrl'
])
.config(function($locationProvider) {
	$locationProvider.html5Mode({ enabled: true, requireBase: false });
})
.run(function() {
});
