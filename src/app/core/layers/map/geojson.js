const {inherits} = require('core/utils/utils');
const VectorLayer = require('./vectorlayer');

function GeojsonLayer(options = {}) {
  const provider = options.provider;
  this.setProvider(provider);
  GeojsonLayer.base(this, 'constructor', options);
  this.getFeatures({
    url: options.url,
    mapProjection: this.mapProjection
  });
}

inherits(GeojsonLayer, VectorLayer);

module.exports = GeojsonLayer;
