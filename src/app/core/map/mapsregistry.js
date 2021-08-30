const {inherits} = require('core/utils/utils');
const G3WObject = require('core/g3wobject');

function MapsRegistry() {
  MapsRegistry.base(this, 'constructor');
  this._mapsServices = {};
}
inherits(MapsRegistry,G3WObject);

const proto = MapsRegistry.prototype;

proto.addMap = function(mapService) {
  this._registerMapService(mapService);
};

proto._registerMapService = function(mapService) {
  if (!this._mapsServices[mapService.id]) this._mapsServices[mapService.id] = mapService;
};

module.exports = MapsRegistry;
