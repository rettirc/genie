angular.module('genie.state-config', [])
.config(function(
		$stateProvider
	) {
	$stateProvider
			.state('layout', {
				abstract: true,
				url: '',
				views: {
					nav: {
						templateUrl: 'states/nav/nav-tmpl.html',
						controller: 'NavCtrl'
					},
					layout: {
						templateUrl: 'states/layout/layout-tmpl.html',
						controller: 'LayoutCtrl'
					}
				}
			})
			.state('layout.home', {
				url: '/',
				views: {
					page: {
						templateUrl: 'states/home/home-tmpl.html',
						controller: 'HomeCtrl'
					}
				}
			})
			.state('layout.auth', {
				url: '/auth',
				views: {
					page: {
						templateUrl: 'states/auth/auth-tmpl.html',
						controller: 'AuthCtrl'
					}
				}
			})
			.state('layout.river', {
				url: '/river',
				views: {
					page: {
						templateUrl: 'states/river/river-tmpl.html',
						controller: 'RiverCtrl'
					}
				}
			});
	});
