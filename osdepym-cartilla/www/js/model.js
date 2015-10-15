var model = angular.module('model', []);

model.factory('contextoActual', function() {
  var especialidades = [];
  var prestadores = [];
  var prestadorActual = null;
  var tipoBusqueda = '';
  var afiliadoLogueado;
  var coordenadasActuales = {};

  return {
    limpiar: function() {
      especialidades = [];
      prestadores = [];
      prestadorActual = null;
      tipoBusqueda = '';
    },
    getEspecialidades: function() {
      return especialidades;
    },
    setEspecialidades: function(value) {
      especialidades = value;
    },
    getPrestadores: function() {
      return prestadores;
    },
    setPrestadores: function(value) {
      prestadores = value;
    },
    seleccionarPrestador: function(value) {
      prestadorActual = value;
    },
    getPrestadorActual: function() {
      return prestadorActual;
    },
    getTipoBusqueda: function(){
      return tipoBusqueda;
    },
    setTipoBusqueda: function(value){
      tipoBusqueda = value;
    },
    getAfiliadoLogueado: function() {
      return afiliadoLogueado;
    },
    setAfiliadoLogueado: function(value) {
      afiliadoLogueado = value;
    },
    getCoordenadasActuales: function() {
      return coordenadasActuales;
    },
    setCoordenadasActuales: function(value) {
      coordenadasActuales = value;
    }
  };
});

cartilla.namespace('cartilla.model.Afiliado');

cartilla.model.Afiliado = function(dataObject) {
  if(!(this instanceof cartilla.model.Afiliado)) {
    return new cartilla.model.Afiliado(dataObject);
  }

  return {
    getNombre: function() {
      return dataObject.nombre;
    },
    getDNI: function() {
      return dataObject.dni;
    },
    getCUIL: function() {
      return dataObject.cuil;
    },
    getSexo: function() {
      return dataObject.sexo;
    },
    getPlan: function() {
      return dataObject.plan;
    }
  };
};

cartilla.model.Afiliado.getMetadata = function() {
	return {
		name: 'afiliados',
		attributes: [
			{ name: 'nombre', type: 'TEXT' },
			{ name: 'dni', type: 'INTEGER PRIMARY KEY' },
			{ name: 'cuil', type: 'INTEGER' },
			{ name: 'sexo', type: 'TEXT' },
			{ name: 'plan', type: 'TEXT' }
		]
	};
};

cartilla.namespace('cartilla.model.Especialidad');

cartilla.model.Especialidad = function(nombre) {
  if(!(this instanceof cartilla.model.Especialidad)) {
    return new cartilla.model.Especialidad(nombre);
  }

  return {
    getNombre: function() {
      return nombre;
    }
  };
};

cartilla.namespace('cartilla.model.Localidad');

cartilla.model.Localidad = function(nombre) {
  if(!(this instanceof cartilla.model.Localidad)) {
    return new cartilla.model.Localidad(nombre);
  }

  return {
    getNombre: function() {
      return nombre;
    }
  };
};

cartilla.namespace('cartilla.model.Provincia');

cartilla.model.Provincia = function(nombre) {
  if(!(this instanceof cartilla.model.Provincia)) {
    return new cartilla.model.Provincia(nombre);
  }

  return {
    getNombre: function() {
      return nombre;
    }
  };
};

cartilla.namespace('cartilla.model.Prestador');

cartilla.model.Prestador = function(dataObject) {
  if(!(this instanceof cartilla.model.Prestador)) {
    return new cartilla.model.Prestador(dataObject);
  }

  return {
    getId: function(){
      return dataObject.id;
    },
    getNombre: function() {
      return dataObject.nombre;
    },
    getEspecialidad: function() {
      return dataObject.especialidad;
    },
    getCalle: function() {
      return dataObject.calle;
    },
    getNumeroCalle: function() {
      return dataObject.numeroCalle;
    },
    getPiso: function() {
      return dataObject.piso;
    },
    getDepartamento: function() {
      return dataObject.departamento;
    },
    getLocalidad: function() {
      return dataObject.localidad;
    },
    getZona: function() {
      return dataObject.zona;
    },
    getCodigoPostal: function() {
      return dataObject.codigoPostal;
    },
    getCoordenadas: function() {
      if(dataObject.latitud && dataObject.longitud){
        return {
          latitud: dataObject.latitud,
          longitud: dataObject.longitud
        };
      }else{
        return "";
      }

    },
    getTelefonos: function() {
      if(dataObject.telefonos){
        return dataObject.telefonos.split(',');
      }else{
        return "";
      }
    },
    getHorarios: function() {

      if(dataObject.horarios){
        return dataObject.horarios.split(',');
      }else{
        return "";
      }
    },
    getDireccion: function(){
      var direccion = dataObject.calle + " " + dataObject.numeroCalle + " " ;

      if(dataObject.piso != ''){
        direccion += dataObject.piso;
      }

      if(dataObject.departamento != ''){
        direccion += dataObject.departamento;
      }

      if(dataObject.zona != ''){
        direccion += ", " + dataObject.zona;
      }

      if(dataObject.localidad != ''){
        direccion += ", " + dataObject.localidad;
      }

      return direccion;
    }
  };
};

cartilla.model.Prestador.getMetadata = function() {
	return {
		name: 'prestadores',
		attributes: [
			{ name: 'idBaseDeDatos', type: 'INTEGER PRIMARY KEY' },
			{ name: 'nombre', type: 'TEXT' },
			{ name: 'especialidad', type: 'TEXT' },
			{ name: 'calle', type: 'TEXT' },
			{ name: 'numeroCalle', type: 'INTEGER' },
			{ name: 'piso', type: 'TEXT' },
			{ name: 'departamento', type: 'TEXT' },
			{ name: 'localidad', type: 'TEXT' },
			{ name: 'zona', type: 'TEXT' },
			{ name: 'codigoPostal', type: 'INTEGER' },
			{ name: 'latitud', type: 'INTEGER' },
			{ name: 'longitud', type: 'INTEGER' },
			{ name: 'telefonos', type: 'TEXT' },
			{ name: 'horarios', type: 'TEXT' },
		]
	};
};
