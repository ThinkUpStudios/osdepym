angular.module('cartilla.directives', ['services'])

.directive('map', function($ionicPopup, connectionService, geoService) {
  return {
    restrict: 'E',
    scope: {
      onCreate: '&'
    },
    link: function ($scope, $element, $attr) {
      var lat = -34.603818;
      var long = -58.381757;

      connectionService
        .getOnlineObserver()
        .observe(function() {
          chequearMapa();
        });

      var chequearMapa = function() {
        if(typeof google == "undefined" || typeof google.maps == "undefined"){
          geoService.cargarMapa();
        }

        inicializarMapa();
      };

      var inicializarMapa = function() {
        var mapOptions = {
          center: new google.maps.LatLng(lat, long),
          zoom: 14,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var map = new google.maps.Map($element[0], mapOptions);

        $scope.onCreate({map: map});

        google.maps.event.addDomListener($element[0], 'mousedown', function (e) {
          e.preventDefault();

          return false;
        });
      };

      var onDocumentReady = function() {
        if(connectionService.isOnline()) {
          chequearMapa();
        } else {
          $ionicPopup.alert({
            title: 'Información',
            template: 'Se necesita conexión para poder ver el mapa'
          });
        }
      };

      if (document.readyState === "complete") {
        onDocumentReady();
      } else {
        google.maps.event.addDomListener(window, 'load', onDocumentReady);
      }
    }
  }
});
