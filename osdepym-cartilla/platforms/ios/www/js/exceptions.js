cartilla.namespace('cartilla.exceptions.DataException');

cartilla.exceptions.DataException = (function() {
  var message = '';

  var constructor = function(msg) {
    if(!(this instanceof cartilla.exceptions.DataException)) {
      return new cartilla.exceptions.DataException(msg);
    }

    message = msg;
  };

  constructor.prototype.getName = function() {
    return 'DataException';
  };
  constructor.prototype.getMessage = function() {
    return message;
  };

  return constructor;
}());

cartilla.namespace('cartilla.exceptions.ServiceException');

cartilla.exceptions.ServiceException = (function() {
  var message = '';
  var innerException;

  var constructor = function(msg, inner) {
    if(!(this instanceof cartilla.exceptions.ServiceException)) {
      return new cartilla.exceptions.ServiceException(msg, inner);
    }

    message = msg;
    innerException = inner;
  };

  constructor.prototype.getName = function() {
    return 'ServiceException';
  };
  constructor.prototype.getMessage = function() {
    return message;
  };
  constructor.prototype.getInnerException = function() {
    return innerException;
  };

  return constructor;
}());

var exceptions = angular.module('exceptions', []);

exceptions.factory('errorHandler', function($log, $ionicPopup) {
  return {
    handle: function(error, title, showAlert) {
      if(!error || error == '') {
        return '';
      }

      showAlert = showAlert === undefined || showAlert === null ? true : showAlert;

      var logMessage = '';
      var message = '';

      if (error instanceof cartilla.exceptions.ServiceException) {
        logMessage = error.getMessage();
        message = logMessage;

        var innerException = error.getInnerException();

        if (innerException) {
          var innerMessage = innerException instanceof cartilla.exceptions.DataException ?
          innerException.getMessage() :
          innerException;

          logMessage += ' - ' + innerMessage;
        }
      } else if (error instanceof cartilla.exceptions.DataException) {
          logMessage = error.getMessage();
          message = logMessage;
      } else if(error instanceof Error) {
        logMessage = error.message;
        message = logMessage;
      } else {
        logMessage = error['message'] ? error['message'] : error;
        message = logMessage;
      }

      title = title && title != '' ? title : 'Error';
      logMessage = title + ' - ' + logMessage;

      $log.error(logMessage);

      if(showAlert) {
        $ionicPopup.alert({
          title: title,
          template: message
        });
      }

      return message;
    }
  };
});
