const {inherits} = require('core/utils/utils');
const G3WObject = require('core/g3wobject');

const PrinterQGISProvider = require('./qgis/printerQGISProvider');

const Providers = {
  'QGIS': PrinterQGISProvider
};

function PrinterProviderFactory() {
  this.get = function(type = 'QGIS') {
    return new Providers[type];
  };
  PrinterProviderFactory.base(this, 'constructor');
}

inherits(PrinterProviderFactory, G3WObject);

module.exports =  new PrinterProviderFactory;

