const {inherits} = require('core/utils/utils');
const DataProvider = require('core/layers/providers/provider');

function KMLDataProvider(options = {}) {
  KMLDataProvider.base(this, 'constructor', options);
  this._name = 'kml';
}

inherits(KMLDataProvider, DataProvider);

const proto = KMLDataProvider.prototype;

proto.getData = function() {
  const d = $.Deferred();
  return d.promise();
};

module.exports = KMLDataProvider;
