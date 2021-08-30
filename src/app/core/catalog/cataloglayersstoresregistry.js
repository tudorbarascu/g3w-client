const {inherits} = require('core/utils/utils');
const LayersStoresRegistry = require('core/layers/layersstoresregistry');

function CatalogLayersStoresRegistry() {
  CatalogLayersStoresRegistry.base(this, 'constructor');
}

inherits(CatalogLayersStoresRegistry, LayersStoresRegistry);

module.exports = new CatalogLayersStoresRegistry();
