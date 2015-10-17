var services = angular.module('services', ['setup', 'model', 'data']);

services.factory('navigationService', function($ionicHistory, $state, $timeout) {
  return {
    goTo: function(view, delay) {
      $timeout(function () {
        $state.go(view);
      }, delay ? delay : 0);
    },
    goBack: function() {
      if ($state.current.name == 'login' || $state.current.name == 'home' || $state.current.name == 'cartilla') {
        $state.go('home');
      } else {
        $ionicHistory.goBack();
      }
    },
    getCurrentView: function() {
      return $state.current.name;
    }
  };
});

services.factory('connectionService', function($rootScope, $cordovaNetwork) {
  return {
    isOnline: function(){
      if(ionic.Platform.isWebView()) {
        return $cordovaNetwork.isOnline();
      } else {
        return navigator.onLine;
      }
    },
    getOnlineObserver: function() {
      var observer;

      return {
        observe: function(onlineCallback) {
          observer = onlineCallback;

          if(ionic.Platform.isWebView()){
            $rootScope.$on('$cordovaNetwork:online', function(event, networkState) {
              if(observer) {
                observer();
              }
            });
          }
          else {
            window.addEventListener("online", function(e) {
              if(observer) {
                observer();
              }
            }, false);
          }
        },
        unobserve: function() {
          observer = undefined;
        }
      };
    },
    getOfflineObserver: function() {
      var observer;

      return {
        observe: function(offlineCallback) {
          observer = offlineCallback;

          if(ionic.Platform.isWebView()){
             $rootScope.$on('$cordovaNetwork:offline', function(event, networkState) {
                if(observer) {
                  observer();
                }
             });
          }
          else {
           window.addEventListener("offline", function(e) {
             if(observer) {
               observer();
             }
           }, false);
          }
        },
        unobserve: function() {
          observer = undefined;
        }
      };
    }
  }
});

services.factory('afiliadosService', function($http, $httpParamSerializer, $q, geoService, dataProvider, configuration) {
  var async = $q;

  return {
    loguearAfiliadoAsync: function(dni, sexo) {
       var deferred = async.defer();

       $http.get(configuration.serviceUrls.getAfiliado.replace('<dni>', dni).replace('<sexo>', sexo))
          .then(function(response) {
              if(response.data && response.data.afiliadoTO) {
                dataProvider
                  .addAfiliadoAsync(response.data.afiliadoTO)
                  .then(function (success) {
                    if(success) {
                      deferred.resolve(new cartilla.model.Afiliado(response.data.afiliadoTO));
                    } else {
                      deferred.resolve(null);
                    }
                  }, function (error) {
                    deferred.reject(new cartilla.exceptions.ServiceException('Error al guardar el afiliado', error));
                  });
              } else {
                deferred.reject(new cartilla.exceptions.ServiceException('No existe un afiliado con DNI ' + dni + " y Sexo "+sexo));
              }
          }, function(error) {
              //TODO: Solo para hacer pruebas desde el browser respondo con un objeto harcode.
              deferred.reject(new cartilla.exceptions.ServiceException('Ocurrio un error al buscar el afiliado', error));
/*
              var afiliadoMock = { nombre: 'Afiliado prueba 1', dni: 31372955, cuil: 20313729550, sexo: 'M', plan: 'Plata' };

              dataProvider.addAfiliadoAsync(afiliadoMock)
                  .then(function (success) {
                    if(success) {
                      deferred.resolve(new cartilla.model.Afiliado(afiliadoMock));
                    } else {
                      deferred.resolve(null);
                    }
                  }, function (error) {
                    deferred.reject(new cartilla.exceptions.ServiceException('Error al guardar el afiliado', error));
                  });
*/
          });

       return deferred.promise;
    },
    getAfiliadoLogueadoAsync: function(){
      return dataProvider.getAfiliadoAsync();
    },
    registrarLlamadoAsync: function() {
      var deferred = async.defer();

      var postAsync = function(data, deferred) {
        var postConfiguration = {
         method: 'POST',
         url: configuration.serviceUrls.registrarLlamado,
         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
         data: $httpParamSerializer(data)
        };

        $http(postConfiguration)
          .then(function(response) {
            if(response.status >=200 && response.status < 300) {
              deferred.resolve(true);
            } else {
              deferred.reject(new cartilla.exceptions.ServiceException('Error al registrar la llamada. Codigo: ' + response.status + ', Detalle: ' + response.statusText));
            }
          }, function(response) {
            deferred.reject(new cartilla.exceptions.ServiceException('Error al registrar la llamada. Codigo: ' + response.status + ', Detalle: ' + response.statusText));
          });
      };

      dataProvider
        .getAfiliadoAsync()
        .then(function (afiliado) {
            if(!afiliado) {
              deferred.reject(new cartilla.exceptions.ServiceException('No existe un afiliado logueado. No puede registrarse la llamada'));

              return;
            }

            var postData = {
              dni : afiliado.getDNI(),
              nombre : afiliado.getNombre(),
              cuil : afiliado.getCUIL(),
              sexo : afiliado.getSexo(),
              plan : afiliado.getPlan()
            };

            geoService
              .getCoordenadasActualesAsync()
              .then(function(coordenadas) {
                  postData['latitud'] = coordenadas.position.coords.latitude;
                  postData['longitud'] = coordenadas.position.coords.longitude;

                  postAsync(postData, deferred);
              }, function(error) {
                postAsync(postData, deferred);
              });
          }, function (error) {
            deferred.reject(new cartilla.exceptions.ServiceException('No pudo obtenerse el afiliado logueado. No puede registrarse la llamada', error));
          }
        );

      return deferred.promise;
    }
  };
});

services.factory('opcionesService', function($q, dataProvider, contextoActual, configuration) {
  var async = $q;

  return {
    getEspecialidadesAsync: function() {
      var deferred = async.defer();

      if(contextoActual.getEspecialidades().length == 0) {
        dataProvider
          .getEspecialidadesAsync()
          .then(function(especialidades) {
            contextoActual.setEspecialidades(especialidades);
            deferred.resolve(especialidades);
          }, function(error) {
            deferred.reject(new cartilla.exceptions.ServiceException('Ocurrio un error al obtener especialidades', error));
          });
      } else {
        deferred.resolve(contextoActual.getEspecialidades());
      }

      return deferred.promise;
    },
    getProvinciasAsync: function(especialidad) {
     return dataProvider.getProvinciasAsync(especialidad);
    },
    getLocalidadesAsync: function(provincia) {
      return dataProvider.getLocalidadesAsync(provincia);
    }
  };
});

services.factory('prestadoresService', function($q, dataProvider, configuration) {
  var async = $q;

  var isInZone = function(prestador, coordinates) {
    var radium = configuration.searchRadiumInMeters;
    //TODO: Code this method base on current coordinates and radium
  };

  return {
    getAllPrestadoresAsync: function() {
      var deferred = async.defer();

      dataProvider.getPrestadoresAsync()
      .then(function (prestadores) {
         deferred.resolve(prestadores);
      }, function (error) {
        deferred.reject(new cartilla.exceptions.ServiceException('Ocurrio un error al obtener prestadores', error));
      });

      return deferred.promise;
    },
    getPrestadoresByEspecialidadAsync: function(especialidad, zona, localidad) {
      var deferred = async.defer();
      var criteria = [{field: 'especialidad', comparer: 'LIKE', value: especialidad}];

      if(zona && zona !== '') {
       criteria.push({field: 'zona', value: zona});
      }

      if(localidad && localidad !== '') {
        criteria.push({field: 'localidad', value: localidad});
      }

      dataProvider
      .getPrestadoresByAsync(criteria)
      .then(function (prestadores) {
         deferred.resolve(prestadores);
      }, function (error) {
        deferred.reject(new cartilla.exceptions.ServiceException('Ocurrio un error al obtener prestadores', error));
      });

     return deferred.promise;
   },
   getPrestadoresByNombreAsync: function(nombre) {
     var deferred = async.defer();
     var criteria = [{field: 'nombre', comparer: 'LIKE', value: nombre}];

     dataProvider.getPrestadoresByAsync(criteria)
      .then(function (prestadores) {
         deferred.resolve(prestadores);
      }, function (error) {
        deferred.reject(new cartilla.exceptions.ServiceException('Ocurrio un error al obtener prestadores', error));
      });

    return deferred.promise;
   },
   getPrestadoresByCercaniaAsync: function(especialidad, coordinates) {
    var deferred = async.defer();
    var criteria = [{field: 'especialidad', comparer: 'LIKE', value: especialidad}];

    dataProvider.getPrestadoresByAsync(criteria)
     .then(function (prestadores) {
        var result = [];

        for(var i = 0; i < prestadores.length; i ++) {
           if(isInZone(prestadores[i], coordinates)) {
             result.push(prestadores[i]);
           }
        }

        deferred.resolve(result);
     }, function (error) {
       deferred.reject(new cartilla.exceptions.ServiceException('Ocurrio un error al obtener prestadores', error));
     });

     return deferred.promise;
   }
  };
});

services.factory('actualizacionService', function($q, $http, dataProvider, contextoActual, configuration) {
  var async = $q;

  return {
    actualizarCartillaAsync: function(dni, sexo) {
      var deferred = async.defer();

      $http.get(configuration.serviceUrls.getPrestadores.replace('<dni>', dni).replace('<sexo>', sexo))
         .then(function (response) {
              dataProvider
                .actualizarCartillaAsync(response.data)
                .then(function (result) {
                    contextoActual.limpiar();
                    deferred.resolve(result);
                  }, function (error) {
                    deferred.reject(new cartilla.exceptions.ServiceException('Ocurrio un error al actualizar la cartilla', error));
                  });
         }, function (error) {
            //TODO: Solo para hacer pruebas desde el browser respondo con un objeto harcode.
            deferred.reject(new cartilla.exceptions.ServiceException('Ocurrio un error al actualizar la cartilla', error));
/*             var prestadoresMock = [
              {"prestadorTO": {"calle": "A MARIA SAENZ","codigoPostal": 1832,"departamento": "","especialidad": "LABORATORIO DE ANÁLISIS CLÍNIC","idBaseDeDatos": 0,"latitud": -34.757958,"localidad": "LOMAS DE ZAMORA","longitud": -58.401291,"nombre": ".CEPRESALUD","numeroCalle": 355,"piso": "","telefonos": "(  54)( 011)  42445891","zona": "GBA SUR", "horarios": ["Jueves de 12:00hs. a 20:00hs.","Martes de 12:00hs. a 20:00hs."]}},
              {"prestadorTO": {"calle": "AGUERO","codigoPostal": 1425,"departamento": "Dpto. 2","especialidad": "LABORATORIO DE ANÁLISIS CLÍNIC","idBaseDeDatos": 1,"latitud": "-34.595140","localidad": "RECOLETA","longitud": -58.409447,"nombre": ".CEPRESALUD","numeroCalle": 1238,"piso": "Piso PB","telefonos": "(  54)( 011)  49620541","zona": "CAPITAL FEDERAL"}},
              {"prestadorTO": {"calle": "AGUERO","codigoPostal": 1425,"departamento": "Dpto. 2","especialidad": "CARDIOLOGÍA","idBaseDeDatos": 2,"latitud": "-34.595150","localidad": "RECOLETA","longitud": -58.409447,"nombre": ".CEPRESALUD1","numeroCalle": 1238,"piso": "Piso PB","telefonos": "(  54)( 011)  49620541","zona": "CAPITAL FEDERAL"}},
              {"prestadorTO": {"calle": "AGUERO","codigoPostal": 1425,"departamento": "Dpto. 2","especialidad": "CARDIOLOGÍA","idBaseDeDatos": 3,"latitud": "-34.595140","localidad": "RECOLETA","longitud": -58.409446,"nombre": ".CEPRESALUD2","numeroCalle": 1238,"piso": "Piso PB","telefonos": "(  54)( 011)  49620541","zona": "CAPITAL FEDERAL"}},
              {"prestadorTO": {"calle": "AGUERO","codigoPostal": 1425,"departamento": "Dpto. 2","especialidad": "CARDIOLOGÍA","idBaseDeDatos": 4,"localidad": "RECONTRALETA","nombre": ".CEPRESALUD3","numeroCalle": 1238,"piso": "Piso PB","zona": "CAPITAL FEDERAL"}},
              {"prestadorTO": {"calle": "AGUERO","codigoPostal": 1425,"departamento": "Dpto. 2","especialidad": "CARDIOLOGÍA","idBaseDeDatos": 5,"latitud": "-36.595110","localidad": "RECOLETA","longitud": -58.409445,"nombre": ".CEPRESALUD4","numeroCalle": 1238,"piso": "Piso PB","telefonos": "(  54)( 011)  49620541","zona": "CAPITAL FEDERAL"}},
              {"prestadorTO": {"calle": "AGUERO","codigoPostal": 1425,"departamento": "Dpto. 2","especialidad": "CARDIOLOGÍA","idBaseDeDatos": 6,"latitud": "-37.595140","localidad": "RECOLETA","longitud": -58.409442,"nombre": ".CEPRESALUD5","numeroCalle": 1238,"piso": "Piso PB","telefonos": "(  54)( 011)  49620541","zona": "CAPITAL FEDERAL"}},
              {"prestadorTO": {"calle": "AGUERO","codigoPostal": 1425,"departamento": "Dpto. 2","especialidad": "CARDIOLOGÍA","idBaseDeDatos": 7,"latitud": "-38.595120","localidad": "RECOLETA","longitud": -58.409441,"nombre": ".CEPRESALUD6","numeroCalle": 1238,"piso": "Piso PB","telefonos": "(  54)( 011)  49620541","zona": "CAPITAL FEDERAL"}},
              {"prestadorTO": {"calle": "AGUERO","codigoPostal": 1425,"departamento": "Dpto. 2","especialidad": "CARDIOLOGÍA","idBaseDeDatos": 8,"latitud": "-39.595140","localidad": "RECOLETA","longitud": -58.409440,"nombre": ".CEPRESALUD7","numeroCalle": 1238,"piso": "Piso PB","telefonos": "(  54)( 011)  49620541","zona": "CAPITAL FEDERAL"}},
              {"prestadorTO": {"calle": "AGUERO","codigoPostal": 1425,"departamento": "Dpto. 2","especialidad": "CARDIOLOGÍA","idBaseDeDatos": 9,"latitud": "-30.595130","localidad": "RECOLETA","longitud": -58.409445,"nombre": ".CEPRESALUD8","numeroCalle": 1238,"piso": "Piso PB","telefonos": "(  54)( 011)  49620541","zona": "CAPITAL FEDERAL"}},
              {"prestadorTO": {"calle": "AGUERO","codigoPostal": 1425,"departamento": "Dpto. 2","especialidad": "CARDIOLOGÍA","idBaseDeDatos": 10,"latitud": "-34.565040","localidad": "RECOLETA","longitud": -58.409447,"nombre": ".CEPRESALUD9","numeroCalle": 1238,"piso": "Piso PB","telefonos": "(  54)( 011)  49620541","zona": "CAPITAL FEDERAL"}},
              {"prestadorTO": {"calle": "AGUERO","codigoPostal": 1425,"departamento": "Dpto. 2","especialidad": "CARDIOLOGÍA","idBaseDeDatos": 11,"latitud": "-34.577240","localidad": "RECOLETA","longitud": -58.409442,"nombre": ".CEPRESALUD0","numeroCalle": 1238,"piso": "Piso PB","telefonos": "(  54)( 011)  49620541","zona": "CAPITAL FEDERAL"}},
              {"prestadorTO": {"calle": "AGUERO","codigoPostal": 1425,"departamento": "Dpto. 2","especialidad": "CARDIOLOGÍA","idBaseDeDatos": 12,"latitud": "-34.512130","localidad": "RECOLETA","longitud": -58.409441,"nombre": ".CEPRESALUD10","numeroCalle": 1238,"piso": "Piso PB","telefonos": "(  54)( 011)  49620541","zona": "CAPITAL FEDERAL"}},
              {"prestadorTO": {"calle": "AGUERO","codigoPostal": 1425,"departamento": "Dpto. 2","especialidad": "CARDIOLOGÍA","idBaseDeDatos": 13,"latitud": "-34.523120","localidad": "RECOLETA","longitud": -58.409442,"nombre": ".CEPRESALUD11","numeroCalle": 1238,"piso": "Piso PB","telefonos": "(  54)( 011)  49620541","zona": "CAPITAL FEDERAL"}},
              {"prestadorTO": {"calle": "AGUERO","codigoPostal": 1425,"departamento": "Dpto. 2","especialidad": "CARDIOLOGÍA","idBaseDeDatos": 14,"latitud": "-34.541141","localidad": "RECOLETA","longitud": -58.409443,"nombre": ".CEPRESALUD12","numeroCalle": 1238,"piso": "Piso PB","telefonos": "(  54)( 011)  49620541","zona": "CAPITAL FEDERAL"}},
              {"prestadorTO": {"calle": "AGUERO","codigoPostal": 1425,"departamento": "Dpto. 2","especialidad": "CARDIOLOGÍA","idBaseDeDatos": 15,"latitud": "-50.511142","localidad": "RECOLETA","longitud": -58.409445,"nombre": ".CEPRESALUD13","numeroCalle": 1238,"piso": "Piso PB","telefonos": "(  54)( 011)  49620541","zona": "CAPITAL FEDERAL"}},
              {"prestadorTO": {"calle": "AGUERO","codigoPostal": 1425,"departamento": "Dpto. 2","especialidad": "CARDIOLOGÍA","idBaseDeDatos": 16,"latitud": "-34.501143","localidad": "RECOLETA","longitud": -58.409440,"nombre": ".CEPRESALUD14","numeroCalle": 1238,"piso": "Piso PB","telefonos": "(  54)( 011)  49620541","zona": "CAPITAL FEDERAL"}},
              {"prestadorTO": {"calle": "AGUERO","codigoPostal": 1425,"departamento": "Dpto. 2","especialidad": "CARDIOLOGÍA","idBaseDeDatos": 17,"latitud": "-100.592144","localidad": "RECOLETA","longitud": -58.409449,"nombre": ".CEPRESALUD15","numeroCalle": 1238,"piso": "Piso PB","telefonos": "(  54)( 011)  49620541","zona": "CAPITAL FEDERAL"}},
              {"prestadorTO": {"calle": "AGUERO","codigoPostal": 1425,"departamento": "Dpto. 2","especialidad": "CARDIOLOGÍA CARDIOLOGÍA CARDIOLOGÍA CARDIOLOGÍA CARDIOLOGÍA CARDIOLOGÍA CARDIOLOGÍA CARDIOLOGÍA CARDIOLOGÍA CARDIOLOGÍA CARDIOLOGÍA CARDIOLOGÍA CARDIOLOGÍA CARDIOLOGÍA CARDIOLOGÍA CARDIOLOGÍA CARDIOLOGÍA ","idBaseDeDatos": 18,"latitud": "-34.597145","localidad": "RECOLETA","longitud": -58.409448,"nombre": ".CEPRESALUD16","numeroCalle": 1238,"piso": "Piso PB","telefonos": "(  54)( 011)  49620541","zona": "CAPITAL FEDERAL"}},
              {"prestadorTO": {"calle": "ALMAFUERTE","codigoPostal": 1754,"departamento": "","especialidad": "LABORATORIO DE ANÁLISIS CLÍNIC","idBaseDeDatos": 19,"latitud": -34.681472,"localidad": "SAN JUSTO","longitud": -58.555087,"nombre": ".CEPRESALUD","numeroCalle": 3545,"piso": "","telefonos": "(  54)( 011)  44821472", "zona": "GBA OESTE"}}
            ];


            dataProvider.actualizarCartillaAsync(prestadoresMock)
              .then(function (result) {
                  deferred.resolve(result);
                }, function (error) {
                  handle(error, deferred);
                });
*/
         });

      return deferred.promise;
    }
  };
});

services.factory('geoService', function($q, $cordovaGeolocation, contextoActual, $ionicLoading) {
  var async = $q;

  return {
    cargarMapa: function() {
      var script = document.createElement("script");

      script.type = 'text/javascript';
      script.id = 'googleMaps';
      script.src = 'http://maps.google.com/maps/api/js?key=AIzaSyD_7ohmG9gDaQNX2vJ5D5ZsVjHv0Jfr2us&sensor=true';

      document.body.appendChild(script);
    },
    getCoordenadasActualesAsync: function() {
      var deferred = async.defer();
      var horaActual = new Date();

      if(contextoActual.getCoordenadasActuales() && contextoActual.getCoordenadasActuales().horaTomada){
        var dif = (Math.abs(horaActual.getTime() - contextoActual.getCoordenadasActuales().horaTomada.getTime()))/1000;

        if(dif < 120){
          var posOptions = {timeout: 30000, enableHighAccuracy: false};

          $cordovaGeolocation
            .getCurrentPosition(posOptions)
            .then(function (position) {
              var coordenadas = {
                position: position,
                horaTomada: new Date()
              };
              contextoActual.setCoordenadasActuales(coordenadas);
            }, function (err) {

            });

          deferred.resolve(contextoActual.getCoordenadasActuales());
        }
        else{
          $ionicLoading.show({
            content: 'Obteniendo ubicación actual...',
            showBackdrop: false
          });

          var posOptions = {timeout: 5000, enableHighAccuracy: false};

          $cordovaGeolocation
            .getCurrentPosition(posOptions)
            .then(function (position) {
              var coordenadas = {
                position: position,
                horaTomada: new Date()
              };

              contextoActual.setCoordenadasActuales(coordenadas);
              $ionicLoading.hide();
              deferred.resolve(coordenadas);
            }, function (err) {
              $ionicLoading.hide();
              deferred.resolve(contextoActual.getCoordenadasActuales());
            });
        }
      }
      else{
        $ionicLoading.show({
          content: 'Obteniendo ubicación actual...',
          showBackdrop: false
        });

        var posOptions = {timeout: 20000, enableHighAccuracy: false};

        $cordovaGeolocation
          .getCurrentPosition(posOptions)
          .then(function (position) {
            var coordenadas = {
              position: position,
              horaTomada: new Date()
            };
            contextoActual.setCoordenadasActuales(coordenadas);
            $ionicLoading.hide();
            deferred.resolve(coordenadas);
          }, function (err) {
            $ionicLoading.hide();
            errorHandler.handle(new cartilla.exceptions.ServiceException('No se pudo obtener la ubicación actual', err), 'Error');
          });
      }

      return deferred.promise;
    }
  };
});
