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
			.state('layout.upload', {
				url: '/upload',
				views: {
					page: {
						templateUrl: 'states/upload/upload-tmpl.html',
						controller: 'UploadCtrl'
					}
				}
			})
            .state('layout.detail', {
				url: '/detail',
				views: {
					page: {
						templateUrl: 'states/detail/detail-tmpl.html',
						controller: 'DetailCtrl'
					}
				}
			})
			// Renaming this is generating a bug
			// .state('layout.river', {
			// 	url: '/river',
			// 	views: {
			// 		page: {
			// 			templateUrl: 'states/river/river-tmpl.html',
			// 			controller: 'RiverCtrl'
			// 		}
			// 	}
			// })
			.state('layout.branch', {
				url: '/river',
				views: {
					page: {
						templateUrl: 'states/branch/branch-tmpl.html',
						controller: 'BranchCtrl'
					}
				}
			})
			.state('layout.gallery', {
				url: '/gallery',
				views: {
					page: {
						templateUrl: 'states/gallery/gallery-tmpl.html',
						controller: 'GalleryCtrl'
					}
				}
			})
			.state('layout.attribute', {
				url: '/attribute',
				views: {
					page: {
						templateUrl: 'states/attribute/attribute-tmpl.html',
						controller: 'AttributeCtrl'
					}
				}
			})
			.state('layout.map', {
				url: '/map',
				views: {
					page: {
						templateUrl: 'states/map/map-tmpl.html',
						controller: 'MapCtrl'
					}
				}
			});
	});
