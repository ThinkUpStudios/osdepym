var setup = angular.module('setup', []);

setup.factory('configuration', function() {
  var baseUrl = 'http://www.osdepym.com.ar:8080/OSDEPYM_CartillaWeb2/rest/mobile/<method>';

  return {
    useDataBase: true,
    reCreateDataBase: false,
	  dbName: 'osdepym.db',
    searchRadiumInMeters: 1000,
    serviceUrls: {
      getAfiliado: baseUrl.replace('<method>', 'getAfiliado?dni=<dni>&sexo=<sexo>'),
      getPrestadores: baseUrl.replace('<method>', 'cartilla?dni=<dni>&sexo=<sexo>'),
      registrarLlamado: baseUrl.replace('<method>', 'registrarLlamado')
    }
  };
});

var cartilla = cartilla || {};

cartilla.namespace = function(name) {
  var parts = name.split('.');
  var parent = cartilla;
  var i;

  if(parts[0] === 'cartilla') {
    parts = parts.slice(1);
  }

  for(i = 0; i < parts.length; i++) {
    if(typeof parent[parts[i]] === 'undefined') {
      parent[parts[i]] = {};
    }

    parent = parent[parts[i]];
  }

  return parent;
};

cartilla.constants = (function() {
  return {
    tiposBusqueda: {
      ESPECIALIDAD: 'ESPECIALIDAD',
      NOMBRE: 'NOMBRE',
      CERCANIA: 'CERCANÍA'
    },
    filtrosBusqueda: {
      ESPECIALIDADES: 'especialidades',
      PROVINCIAS: 'provincias',
      LOCALIDADES: 'localidades',
      PRESTADORES: 'prestadores'
    }
  };
})();


