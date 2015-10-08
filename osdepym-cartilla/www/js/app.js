// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
String.prototype.contains = function (it) {
  return this.indexOf(it) != -1;
};

angular.module('cartilla', ['ionic', 'ngCordova', 'controllers', 'cartilla.directives'])
  .run(function ($cordovaSplashscreen, $state, $ionicPlatform, dataProvider, afiliadosService, contextoActual) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
      }

      if (window.StatusBar) {
        StatusBar.styleDefault();
      }

      dataProvider.initialize();

      afiliadosService.getAfiliadoLogueadoAsync()
        .then(
          function onSuccess(af) {
            $cordovaSplashscreen.hide();
            if (af) {
              contextoActual.setAfiliadoLogueado(af);
              $state.go("home");
            } else {
              $state.go("login");
            }
          }, function onError(error) {
            $cordovaSplashscreen.hide();
            $state.go("login");
          }
        );
    });
  })
  .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $ionicConfigProvider.views.maxCache(1000);
    //$ionicConfigProvider.views.forwardCache(true);
    $ionicConfigProvider.views.transition('none');

    $stateProvider
      .state('home', {
        url: '/home',
        views: {
          '': {
            templateUrl: 'templates/home.html'
          }
        }
      });

    $stateProvider
      .state('cartilla', {
        url: '/cartilla',
        views: {
          '': {
            templateUrl: 'templates/cartilla.html'
          }
        }
      });

    $stateProvider
      .state('login', {
        url: '/login',
        views: {
          '': {
            templateUrl: 'templates/login.html'
          }
        }
      });

    $stateProvider.state('busquedaNombre', {
      url: '/busquedaNombre',
      views: {
        '': {
          templateUrl: 'templates/busqueda_nombre.html'
        }
      }
    });

    $stateProvider.state('busquedaEspecialidad', {
      url: '/busquedaEspecialidad',
      views: {
        '': {
          templateUrl: 'templates/busqueda_especialidad.html'
        }
      }
    });

    $stateProvider.state('busquedaCercania', {
      url: '/busquedaCercania',
      views: {
        '': {
          templateUrl: 'templates/busqueda_cercania.html'
        }
      }
    });

    $stateProvider.state('resultados', {
      url: '/resultados',
      views: {
        '': {
          templateUrl: 'templates/resultado_busqueda.html'
        }
      }
    });

    $stateProvider.state('detallePrestador', {
      url: '/detallePrestador',
      views: {
        '': {
          templateUrl: 'templates/detalle_prestador.html'
        }
      }
    });

    $stateProvider
      .state('mapa', {
        url: '/mapa',
        views: {
          '': {
            templateUrl: 'templates/resultado_mapa.html',
            controller: 'MapCtrl'
          }
        }
      });

    $urlRouterProvider.otherwise('/login');
  });


