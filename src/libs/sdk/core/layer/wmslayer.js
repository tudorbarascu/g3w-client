var inherit = require('core/utils/utils').inherit;
var base = require('core/utils/utils').base;
var geo = require('core/utils/geo');
var LayerState = require('core/layer/layerstate');
var MapLayer = require('core/map/maplayer');
var RasterLayers = require('g3w-ol3/src/layers/rasters');

function WMSLayer(options,extraParams){
  var self = this;
  this.LAYERTYPE = {
    LAYER: 'layer',
    MULTILAYER: 'multilayer'
  };

  this.extraParams = extraParams
  this.layers = [];
  
  base(this,options);
}
inherit(WMSLayer,MapLayer)
var proto = WMSLayer.prototype;

proto.getOLLayer = function(){
  var olLayer = this._olLayer;
  if (!olLayer){
    olLayer = this._olLayer = this._makeOlLayer();
  }
  return olLayer;
};

proto.getSource = function(){
  return this.getOLLayer().getSource();
};

proto.getInfoFormat = function() {
  return 'application/vnd.ogc.gml';
};

proto.getGetFeatureInfoUrl = function(coordinate,resolution,epsg,params){
  return this.getOLLayer().getSource().getGetFeatureInfoUrl(coordinate,resolution,epsg,params);
};

proto.getLayerConfigs = function(){
  return this.layers;
};

proto.addLayer = function(layerConfig){
  this.layers.push(layerConfig);
};

proto.toggleLayer = function(layer){
  _.forEach(this.layers,function(_layer){
    if (_layer.id == layer.id){
      _layer.visible = layer.visible;
    }
  });
  this._updateLayers();
};
  
proto.update = function(mapState,extraParams){
  this._updateLayers(mapState,extraParams);
};

proto.isVisible = function(){
  return this._getVisibleLayers().length > 0;
};

proto.getQueryUrl = function(){
  var layer = this.layers[0];
  if (layer.infourl && layer.infourl != '') {
    return layer.infourl;
  }
  return this.config.url;
};

proto.getQueryableLayers = function(){ 
  var self = this;
  var layer = this.layers[0];
  var queryLayers = [];
  _.forEach(this.layers,function(layer){
    if (LayerState.isQueryable(layer)) {
      var queryUrl = LayerState.getQueryUrl(layer);
      var infoFormat = LayerState.getInfoFormat(layer),
      queryUrl = queryUrl ? queryUrl : self.config.url;
      infoFormat = infoFormat ? infoFormat : self.getInfoFormat();
      queryLayers.push({
        layerName: LayerState.getWMSLayerName(layer),
        queryUrl: queryUrl,
        infoFormat: infoFormat,
        queryLayerName: LayerState.getQueryLayerName(layer),
        geometryType: LayerState.getGeometryType(layer),
        attributes: LayerState.getAttributes(layer)
      });
    }
  });
  return queryLayers;
};

proto._makeOlLayer = function(){
  var self = this;
  var wmsConfig = {
    url: this.config.url,
    id: this.config.id
  };
  
  var representativeLayer = this.layers[0]; //BRUTTO, DEVO PRENDERE UN LAYER A CASO (IL PRIMO) PER VEDERE SE PUNTA AD UN SOURCE DIVERSO (dovrebbe accadere solo per i layer singoli, WMS esterni)
  
  if (representativeLayer.source && representativeLayer.source.type == 'wms' && representativeLayer.source.url){
    wmsConfig.url = representativeLayer.source.url;
  };
  
  var olLayer = new RasterLayers.WMSLayer(wmsConfig,this.extraParams);
  
  olLayer.getSource().on('imageloadstart', function() {
        self.emit("loadstart");
      });
  olLayer.getSource().on('imageloadend', function() {
      self.emit("loadend");
  });
  
  return olLayer
};

proto._getVisibleLayers = function(mapState){
  var self = this;
  var visibleLayers = [];
  _.forEach(this.layers,function(layer){
    var resolutionBasedVisibility = layer.maxresolution ? (layer.maxresolution && layer.maxresolution > mapState.resolution) : true;
    if (layer.visible && resolutionBasedVisibility) {
      visibleLayers.push(layer);
    }    
  })
  return visibleLayers;
};

proto.checkLayerDisabled = function(layer,resolution) {
  var scale = geo.resToScale(resolution);
  var enabled = true;
  if (layer.maxresolution){
    enabled = enabled && (layer.maxresolution > resolution);
  }
  if (layer.minresolution){
    enabled = enabled && (layer.minresolution < resolution);
  }
  if (layer.minscale) {
    enabled = enabled && (layer.minscale > scale);
  }
  if (layer.maxscale) {
    enabled = enabled && (layer.maxscale < scale);
  }
  layer.disabled = !enabled;
};

proto.checkLayersDisabled = function(resolution){
  var self = this;
  _.forEach(this.layers,function(layer){
    self.checkLayerDisabled(layer,resolution);
  });
};

proto._updateLayers = function(mapState,extraParams){
  this.checkLayersDisabled(mapState.resolution);
  var visibleLayers = this._getVisibleLayers(mapState);
  if (visibleLayers.length > 0) {
    var params = {
      LAYERS: _.join(_.map(visibleLayers,function(layer){
        return LayerState.getWMSLayerName(layer);
      }),',')
    };
    if (extraParams) {
      params = _.assign(params,extraParams);
    }
    this._olLayer.setVisible(true);
    this._olLayer.getSource().updateParams(params);
  }
  else {
    this._olLayer.setVisible(false);
  }
};

module.exports = WMSLayer;
