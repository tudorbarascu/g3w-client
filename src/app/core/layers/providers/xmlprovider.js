const {inherits} = require('core/utils/utils');;
const DataProvider = require('core/layers/providers/provider');

function XMLDataProvider(options={}) {
  XMLDataProvider.base(this, 'constructor', options);
  this._name = 'xml';
}

inherits(XMLDataProvider, DataProvider);

const proto = XMLDataProvider.prototype;

proto.getData = function() {
  const d = $.Deferred();
  return d.promise();
};

module.exports = XMLDataProvider;
