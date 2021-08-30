const { inherits } = require('core/utils/utils');
const BaseLayer = require('core/layers/baselayers/baselayer');
const BasesLayers = require('g3w-ol/src/layers/bases');

function OSMLayer(config={}, options={}){
  OSMLayer.base(this, 'constructor', config, options);
}

inherits(OSMLayer, BaseLayer);

const proto = OSMLayer.prototype;

proto._makeOlLayer = function() {
  const olLayer = BasesLayers.OSM.get({
    id: this.config.name,
    title: this.config.title,
    url: this.config.url
  });
  return olLayer
};


module.exports = OSMLayer;
