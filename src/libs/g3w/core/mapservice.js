var inherit = require('./utils').inherit;
var deferredValue = require('./utils').deferredValue;
var StateProvider = require('./stateprovider');
var ProjectsRegistry = require('./projectsregistry');
var ProjectService = require('./projectservice');
var ol3helpers = require('g3w-ol3/src/g3w.ol3').helpers;
var MapLayer = require('./maplayer');

function MapService(){
  var self = this;
  this.viewer;
  this.mapLayers = {};
  this.state = {};
  
  ProjectService.on('projectset',function(){
    $script("http://epsg.io/"+ProjectService.state.crs+".js");
    if (!self.viewer){
      self.setupViewer();
    }
    self.setupLayers();
  });
  
  ProjectService.onafter('setLayersVisible',function(layers){
    _.forEach(layers,function(layer){
      var mapLayer = self.getMapLayerForLayer(layer);
      mapLayer.update();
    })
  });
  
  this.setupViewer = function(){
    var extent = ProjectService.state.extent;
    var projection = new ol.proj.Projection({
      code: "EPSG:"+ProjectService.state.crs,
      extent: extent
    });
    this.viewer = ol3helpers.createViewer({
      view: {
        projection: projection,
        center: ol.extent.getCenter(ProjectService.state.extent),
        zoom: 1 
      }
    });
  };
  
  this.setupLayers = function(){
    var layersArray = this.traverseLayersTree(ProjectService.state.layerstree);
    layersArray.forEach(function(layer){
      // è un layer vero, non un folder
      if(!_.get(layer,'nodes')){
        var layerId = 'layer_'+layer.metalayer;
        var mapLayer = _.get(self.mapLayers,layerId);
        if (!mapLayer){
          url = ProjectService.getWmsUrl();
          mapLayer = self.mapLayers[layerId] = new MapLayer({
            id: layerId,
            url: url
          });
          self.viewer.map.addLayer(mapLayer.getOlLayer());
        }
        mapLayer.addLayer(layer);
      }
    });
    
    _.forEach(this.mapLayers,function(mapLayer){
      mapLayer.update();
    })
  };
  
  this.getMapLayerForLayer = function(layer){
    return this.mapLayers['layer_'+layer.metalayer];
  };
  
  this.traverseLayersTree = function(layersTree){
    var self = this;
    var layersArray = [];
    function traverse(obj){
      _.forIn(obj, function (val, key) {
          if (!_.isNil(val.id)) {
              layersArray.unshift(val);
          }
          if (!_.isNil(val.nodes)) {
              traverse(val.nodes);
          }
      });
    }
    traverse(layersTree);
    return layersArray;
  };
  
  this.showViewer = function(elId){
    this.viewer.setTarget(elId);
  };
  
  this.goTo = function(coordinates,zoom){
    var zoom = zoom || 5;
    this.viewer.goTo(coordinates,zoom);
  };
  
  this.goToWGS84 = function(coordinates,zoom){
    var coordinates = ol.proj.transform(coordinates,'EPSG:4326','EPSG:'+ProjectService.state.crs);
    this.goTo(coordinates,zoom);
  };
};

inherit(ProjectService,StateProvider);

module.exports = new MapService