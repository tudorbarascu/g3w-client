const {inherits} = require('core/utils/utils');;
const base = require('core/utils/utils').base;
const G3WObject = require('core/g3wobject');

function PrinterProvider() {
  PrinterProvider.base(this, 'constructor');
}

inherits(PrinterProvider, G3WObject);

const proto = PrinterProvider.prototype;

proto.print = function() {
  console.log('overwrite');
};

proto.getPrintUrl = function() {
  console.log('overwrite');
};

proto.print = function() {
  console.log('overwrite');
};

module.exports =  PrinterProvider;

