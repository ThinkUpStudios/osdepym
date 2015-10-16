var controllers = angular.module('controllers', ['services', 'model', 'exceptions']);

controllers.controller('NavigationController', function ($ionicSideMenuDelegate, $ionicLoading, $location, navigationService, actualizacionService, afiliadosService, errorHandler, contextoActual) {
  var viewModel = this;

  viewModel.back = function () {
    navigationService.goBack();
  };

  viewModel.goTo = function (view, delay) {
    navigationService.goTo(view, delay);
  };

  viewModel.menu = function () {
    $ionicSideMenuDelegate.toggleRight();
  };

  viewModel.relogin = function(){
      $ionicSideMenuDelegate.toggleRight();
      navigationService.goTo('login');
  }

  viewModel.hasBack = function(){
    if(navigationService.getCurrentView() == 'login'){
      return contextoActual.getAfiliadoLogueado();
    } else return navigationService.getCurrentView() != 'home';
  };

  viewModel.hasMenu = function(){
    return navigationService.getCurrentView() == 'home';
  };

  viewModel.actualizar = function () {
    $ionicSideMenuDelegate.toggleRight();
    $ionicLoading.show({
      noBackdrop: true,
      template: '<p class="item-icon-left">Actualizando Cartilla...<ion-spinner icon="lines"/></p>'
    });

    if (contextoActual.getAfiliadoLogueado()) {
      actualizacionService.actualizarCartillaAsync(contextoActual.getAfiliadoLogueado().getDNI(), contextoActual.getAfiliadoLogueado().getSexo())
        .then(function (actualizada) {
          viewModel.cartillaActualizada = actualizada;
          $ionicLoading.hide();
        }, function (error) {
          errorHandler.handle(error, 'Error');
          $ionicLoading.hide();
        });
    }
  };

  viewModel.llamarUrgenciasAsync = function() {
    afiliadosService
      .registrarLlamadoAsync()
      .then(function(registrado) {
          if(!registrado) {
            errorHandler.handle('Error al registrar la llamada', 'Error', true);
          }
        }, function(error) {
          errorHandler.handle(error, 'Error', true);
        });
  };
});

controllers.controller('LoginController', function ($ionicLoading, $ionicPopup, navigationService, actualizacionService, afiliadosService, dataProvider, errorHandler, contextoActual) {
  var viewModel = this;

  var goHome = function () {
    navigationService.goTo('home');
  };

  viewModel.dni = '';
  viewModel.tel = '';
  viewModel.genero = '';

  viewModel.login = function () {
    if(viewModel.dni === '') {
      errorHandler.handle('El DNI es requerido', 'Error');

      return;
    }

    if(viewModel.genero === '') {
      errorHandler.handle('El género es requerido', 'Error');

      return;
    }

    if(contextoActual.getAfiliadoLogueado() && contextoActual.getAfiliadoLogueado().getDNI() === viewModel.dni) {
      errorHandler.handle('El afiliado ya se encuentra logueado', 'Información');

      return;
    }

    $ionicLoading.show({
      noBackdrop: true,
      template: '<p class="item-icon-left">Buscando Afiliado...<ion-spinner icon="lines"/></p>'
    });

    afiliadosService
      .loguearAfiliadoAsync(viewModel.dni, viewModel.genero)
      .then(function (afiliadoLogueado) {
        $ionicLoading.hide();

        if (afiliadoLogueado) {
          $ionicLoading.show({
            noBackdrop: true,
            template: '<p class="item-icon-left">Descargando Cartilla...<ion-spinner icon="lines"/></p>'
          });
          contextoActual.setAfiliadoLogueado(afiliadoLogueado);
          actualizacionService.actualizarCartillaAsync(afiliadoLogueado.getDNI(), afiliadoLogueado.getSexo())
            .then(function success() {
              $ionicLoading.hide();
              goHome();
            }, function error(error) {
              errorHandler.handle(error, 'Error');
              $ionicLoading.hide();
            })
        } else {
          $ionicLoading.hide();
          errorHandler.handle("Ocurrió un error al loguear el afiliado", 'Error');
        }
      }, function (error) {
        errorHandler.handle(error, 'Error');
        $ionicLoading.hide();
      });
  };
});

controllers.controller('EspecialidadSearchController', function ($ionicLoading, navigationService, opcionesService, prestadoresService, errorHandler, contextoActual) {
  var viewModel = this;

  viewModel.isDisabled = true;

  viewModel.especialidades = [];
  viewModel.provincias = [];
  viewModel.localidades = [];

  viewModel.especialidadSeleccionada = '';
  viewModel.provinciaSeleccionada = '';
  viewModel.localidadSeleccionada = '';

  setTimeout(function () {
    viewModel.isDisabled = false
  }, 200);

  $ionicLoading.show();

  opcionesService
    .getEspecialidadesAsync()
    .then(function (especialidades) {
      viewModel.especialidades = especialidades;

      if (especialidades && especialidades[0]) {
        viewModel.especialidadSeleccionada = especialidades[0].getNombre();
        viewModel.filtrarProvincias();
        viewModel.filtrarLocalidades();
      }

      $ionicLoading.hide();
    }, function (error) {
      errorHandler.handle(error, cartilla.constants.filtrosBusqueda.ESPECIALIDADES);
       $ionicLoading.hide();
    });

  viewModel.filtrarProvincias =  function() {
    $ionicLoading.show();

    opcionesService
      .getProvinciasAsync(viewModel.especialidadSeleccionada)
      .then(function (provincias) {
        viewModel.provincias = provincias;
        $ionicLoading.hide();
      }, function (error) {
        errorHandler.handle(error, cartilla.constants.filtrosBusqueda.PROVINCIAS);
        $ionicLoading.hide();
      });
  };

  viewModel.filtrarLocalidades = function() {
    $ionicLoading.show();

    opcionesService
      .getLocalidadesAsync(viewModel.provinciaSeleccionada)
      .then(function (localidades) {
        viewModel.localidades = localidades;
        $ionicLoading.hide();
      }, function (error) {
        errorHandler.handle(error, cartilla.constants.filtrosBusqueda.LOCALIDADES);
        $ionicLoading.hide();
      });
  };

  viewModel.searchByEspecialidad = function () {
    $ionicLoading.show({
      duration: 30000,
      noBackdrop: true,
      template: '<p class="item-icon-left">Buscando Prestadores...<ion-spinner icon="lines"/></p>'
    });
    prestadoresService
      .getPrestadoresByEspecialidadAsync(viewModel.especialidadSeleccionada, viewModel.provinciaSeleccionada, viewModel.localidadSeleccionada)
      .then(function (prestadores) {
        contextoActual.setPrestadores(prestadores);
        contextoActual.setTipoBusqueda(cartilla.constants.tiposBusqueda.ESPECIALIDAD);
        $ionicLoading.hide()
        navigationService.goTo('resultados');
      }, function (error) {
        $ionicLoading.hide();
        errorHandler.handle(error, cartilla.constants.filtrosBusqueda.PRESTADORES);
      });
  };
});

controllers.controller('NombreSearchController', function ($ionicLoading, navigationService, prestadoresService, errorHandler, contextoActual) {
  var viewModel = this;

  viewModel.nombre = '';

  viewModel.searchByNombre = function () {
    if(viewModel.nombre === '') {
      errorHandler.handle('Ingrese un nombre', 'Información');

      return;
    }

    if(viewModel.nombre.length < 3) {
      errorHandler.handle('El nombre debe superar los tres caracteres de longitud', 'Información');

      return;
    }

    $ionicLoading.show({
      content: 'Buscando Prestadores',
      showBackdrop: false
    });
    prestadoresService.getPrestadoresByNombreAsync(viewModel.nombre)
      .then(function (prestadores) {
        contextoActual.setPrestadores(prestadores);
        contextoActual.setTipoBusqueda(cartilla.constants.tiposBusqueda.NOMBRE);
        $ionicLoading.hide();
        navigationService.goTo('resultados');
      }, function (error) {
        errorHandler.handle(error, cartilla.constants.filtrosBusqueda.PRESTADORES);
      });
  };
});

controllers.controller('CercaniaSearchController', function (navigationService, opcionesService, prestadoresService, errorHandler, contextoActual) {
  var viewModel = this;

  viewModel.especialidades = [];
  viewModel.especialidadSeleccionada = '';

  opcionesService
    .getEspecialidadesAsync()
    .then(function (especialidades) {
      viewModel.especialidades = especialidades;

      if (especialidades && especialidades[0]) {
        viewModel.especialidadSeleccionada = especialidades[0].getNombre();
      }
    }, function (error) {
      errorHandler.handle(error, cartilla.constants.filtrosBusqueda.ESPECIALIDADES);
    });

  viewModel.searchByEspecialidad = function () {
    prestadoresService
      .getPrestadoresByEspecialidadAsync(viewModel.especialidadSeleccionada, '', '')
      .then(function (prestadores) {
        contextoActual.setPrestadores(prestadores);
        contextoActual.setTipoBusqueda(cartilla.constants.tiposBusqueda.CERCANIA);
        navigationService.goTo('mapa');
      }, function (error) {
        errorHandler.handle(error, cartilla.constants.filtrosBusqueda.PRESTADORES);
      });
  };
});

controllers.controller('ResultadoBusquedaController', function (navigationService, contextoActual) {
  var viewModel = this;

  viewModel.contextoActual = contextoActual;
  viewModel.titulo = "RESULTADO POR " + contextoActual.getTipoBusqueda().toUpperCase();

  viewModel.seleccionarPrestador = function (prestador) {
    contextoActual.seleccionarPrestador(prestador);

    navigationService.goTo('detallePrestador');
  };
});

controllers.controller('DetallePrestadorController', function ($ionicLoading, $ionicPopup, contextoActual) {
  var viewModel = this;

  viewModel.contextoActual = contextoActual;
  viewModel.titulo = "RESULTADO POR " + contextoActual.getTipoBusqueda().toUpperCase();

  viewModel.map = null;
  viewModel.collapseIcon = "ion-chevron-down";
  viewModel.isCollapsed = true;

  viewModel.tieneTelefono = function () {
    var tels =  viewModel.contextoActual.getPrestadorActual().getTelefonos();

    return tels && tels[0] && tels[0].trim() != "" ;
  };

  viewModel.tieneCoordenadas = function () {
    var coord = viewModel.contextoActual.getPrestadorActual().getCoordenadas();

    return coord && coord.latitud != "" && coord.latitud && coord.longitud != "" && coord.longitud ;
  };

  viewModel.tieneHorarios = function () {
    var hrs = viewModel.contextoActual.getPrestadorActual().getHorarios();

    return hrs && hrs[0] && hrs[0].trim() != "" ;
  };

  viewModel.getMapsUrl = function () {
    var isAndroid = navigator.userAgent.match(/Android/);
    var isIos = navigator.userAgent.match(/(iPhone|iPod|iPad)/);

    if (isAndroid) {
        return "http://maps.google.com/maps?daddr=" + viewModel.getCoordenadasHasta();
    }

    if (isIos) {
       return "http://maps.apple.com/maps?daddr=" + viewModel.getCoordenadasHasta();
    }

    return "http://maps.google.com/maps?daddr=" + viewModel.getCoordenadasHasta();
  };

  viewModel.getCoordenadasHasta = function () {
    var hasta = "" + viewModel.contextoActual.getPrestadorActual().getCoordenadas().latitud + "," +
      viewModel.contextoActual.getPrestadorActual().getCoordenadas().longitud + "";

    return hasta;
  };

  viewModel.getTelefonoContacto = function () {
    if (viewModel.contextoActual.getPrestadorActual().getTelefonos()[0]) {
      return viewModel.contextoActual.getPrestadorActual().getTelefonos()[0].trim().replace(/ /g, '').replace(/\(54\)/g, '').replace(/\(/g, '').replace(/\)/g, '')
    } else {
      return "";
    }
  };

  viewModel.getHorarios = function () {
    var horariosString = "";

    for (i = 0; i < viewModel.contextoActual.getPrestadorActual().getHorarios().length; i++) {
        horariosString += viewModel.contextoActual.getPrestadorActual().getHorarios()[i] + "<br>";
    }

    var horarios = $ionicPopup.alert({
       title: 'Horarios',
       cssClass: 'title-horario',
       template: horariosString
    });
  };

  viewModel.toggleCollapse = function () {
    if (viewModel.isCollapsed) {
      viewModel.collapseIcon = "ion-chevron-up";
    } else {
      viewModel.collapseIcon = "ion-chevron-down";
    }
    viewModel.isCollapsed = !viewModel.isCollapsed;
  };

  viewModel.mapCreated = function (map) {
    viewModel.map = map;

    var myLatLng = {
      lat: contextoActual.getPrestadorActual().getCoordenadas().latitud,
      lng: contextoActual.getPrestadorActual().getCoordenadas().longitud
    };

    var marker = new google.maps.Marker({
      position: myLatLng,
      map: viewModel.map,
      title: contextoActual.getPrestadorActual().getNombre()
    });

    viewModel.map.setCenter(new google.maps.LatLng(contextoActual.getPrestadorActual().getCoordenadas().latitud, contextoActual.getPrestadorActual().getCoordenadas().longitud));
  };
});

controllers.controller('MapCtrl', function ($scope, $ionicLoading, prestadoresService, geoService, contextoActual, errorHandler) {
  $scope.toRad = function (x) {
    return x * Math.PI / 180;
  };
  $scope.distancias = [{name: "1 km", value: 1}, {name: "5 km", value: 5}, {name: "10 km", value: 10}, {
    name: "100 km",
    value: 100
  }];
  $scope.radioBusqueda = $scope.distancias[0];

  $scope.markerCache = [];
  $scope.getDistanceBetweenPoints = function (pos1, pos2) {
    var R = 6371;
    var lat1 = pos1.lat;
    var lon1 = pos1.lng;
    var lat2 = pos2.lat;
    var lon2 = pos2.lng;

    var dLat = $scope.toRad((lat2 - lat1));
    var dLon = $scope.toRad((lon2 - lon1));
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos($scope.toRad(lat1)) * Math.cos($scope.toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;

    return d;

  };
  $scope.mapCreated = function (map) {
    $scope.map = map;


    //Wait until the map is loaded
    google.maps.event.addListenerOnce($scope.map, 'idle', function () {
        //loadMarkers();

        //Reload markers every time the map moves
        google.maps.event.addListener($scope.map, 'dragend', function () {
          console.log("moved!");
          //loadMarkers();
        });

        //Reload markers every time the zoom changes
        google.maps.event.addListener($scope.map, 'zoom_changed', function () {
          console.log("zoomed!");
          //loadMarkers();
        });


        enableMap();

      }
    )
    ;
  };

  $scope.setMapOnAll = function (map) {
    for (var i = 0; i < $scope.markerCache.length; i++) {
      $scope.markerCache[i].setMap(map);
    }
  };
  $scope.updateMarkers = function (distancia) {
    var zoom = 14;
    if(distancia.value == 5){
      zoom = 12;
    }
    if(distancia.value == 10){
      zoom = 11;
    }
    if(distancia.value == 100){
      zoom = 10;
    }
    $scope.map.setZoom(zoom);

    $scope.setMapOnAll(null);
    $scope.markerCache = [];
    var miPos = {
      lat: $scope.miPosicion.coords.latitude,
      lng: $scope.miPosicion.coords.longitude
    };
    var marker;
    for (var index in contextoActual.getPrestadores()) {
      var pos = {
        lat: contextoActual.getPrestadores()[index].getCoordenadas().latitud,
        lng: contextoActual.getPrestadores()[index].getCoordenadas().longitud
      };
      if ($scope.getDistanceBetweenPoints(pos, miPos) <= distancia.value) {
        marker = new google.maps.Marker({
          position: pos,
          map: $scope.map,
          title: contextoActual.getPrestadores()[index].getNombre()
        });
        addInfoWindow(marker, contextoActual.getPrestadores()[index])
        $scope.markerCache.push(marker);
      }

    }
  }
  $scope.centerOnPos = function (pos) {
    console.log("Centering");
    if (!$scope.map) {
      return;
    }
    var latLong = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    $scope.map.setCenter(latLong);
    new google.maps.Marker({
      position: latLong,
      map: $scope.map,
      icon: 'img/green-dot.png',
      title: "Mi Posición"
    });
    $ionicLoading.hide();

  };


  function addInfoWindow(marker, record) {

    var infoWindowContent = '<div id="content">' +
      '<div id="siteNotice">' +
      '</div>' +
      '<b>' + record.getNombre() + '</b>' +
      '<div id="bodyContent">' +
      '<p> ' + record.getDireccion() +
      '</p>' +
      '<a href="#detallePrestador">(Click para ver detalles) </a>' +
      '</div>' +
      '</div>';

    var infoWindow = new google.maps.InfoWindow({
      content: infoWindowContent
    });

    google.maps.event.addListener(marker, 'click', function () {
      contextoActual.seleccionarPrestador(record);

      infoWindow.open($scope.map, marker);
    });

    marker.addListener('click', function () {
      contextoActual.seleccionarPrestador(record);
      infoWindow.open($scope.map, marker);
    });
  };

  function getBoundingRadius(center, bounds) {
    return getDistanceBetweenPoints(center, bounds.northeast, 'miles');
  }

  function enableMap() {
    geoService
      .getCoordenadasActualesAsync()
      .then(function (coordenadas) {
        $scope.miPosicion = coordenadas.position;
        $scope.centerOnPos(coordenadas.position);
        $scope.updateMarkers($scope.radioBusqueda.value);

      }, function (err) {
        errorHandler.handle(err, 'Error');
      });
  }

  function markerExists(lat, lng) {
    var exists = false;
    var cache = markerCache;
    for (var i = 0; i < cache.length; i++) {
      if (cache[i].lat === lat && cache[i].lng === lng) {
        exists = true;
      }
    }

    return exists;
  }

  $scope.crearMarker = function (record) {
    var myLatLng = {lat: record.getCoordenadas().latitud, lng: record.getCoordenadas().longitud};

    var marker = new google.maps.Marker({
      position: myLatLng,
      map: $scope.map,
      title: record.getNombre()
    });

    return marker;
  };
})
;
