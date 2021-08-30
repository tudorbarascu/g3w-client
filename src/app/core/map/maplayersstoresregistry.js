const {inherits} = require('core/utils/utils');
const LayersStoresRegistry = require('core/layers/layersstoresregistry');

function MapLayersStoresRegistry() {
  MapLayersStoresRegistry.base(this, 'constructor');
}

inherits(MapLayersStoresRegistry, LayersStoresRegistry);

module.exports = new MapLayersStoresRegistry();
