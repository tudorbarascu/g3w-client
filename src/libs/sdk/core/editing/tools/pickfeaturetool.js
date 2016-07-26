var inherit = require('g3w/core/utils').inherit;
var base = require('g3w/core/utils').base;
var noop = require('g3w/core/utils').noop;
var G3WObject = require('g3w/core/g3wobject');
var PickFeatureInteraction = require('g3w-ol3/src/interactions/pickfeatureinteraction');

var MapService = require('g3w/core/mapservice');

function PickFeatureTool(editor){
  var self = this;
  this.editor = editor;
  this.isPausable = true;
  this.pickFeatureInteraction = null;
  this._running = false;
  this._busy = false;
  
  // qui si definiscono i metodi che vogliamo poter intercettare, ed eventualmente bloccare (vedi API G3WObject)
  this.setters = {
    pickFeature: noop,
  };
  
  base(this);
}
inherit(PickFeatureTool,G3WObject);
module.exports = PickFeatureTool;

var proto = PickFeatureTool.prototype;

// metodo eseguito all'avvio del tool
proto.run = function(){
  var self = this;
  //var map = MapService.viewer.map;
  var layers = [this.editor.getVectorLayer().getLayer(),this.editor.getEditVectorLayer().getLayer()];
  
  this.pickFeatureInteraction = new PickFeatureInteraction({
    layers: layers
  });
  
  this.pickFeatureInteraction.on('picked',function(e){
    if (!self._busy){
      self._busy = true;
      self.pause(true);
      self.pickFeature(e.feature)
      .then(function(res){
        self._busy = false;
        self.pause(false);
      })
    }
  });
  
  //map.addInteraction(this.pickFeatureInteraction);
  //this.pickFeatureInteraction.setActive(true);
  MapService.pushInteraction(this.pickFeatureInteraction);
};

proto.pause = function(pause){
  if (_.isUndefined(pause) || pause){
    this.pickFeatureInteraction.setActive(false);
  }
  else {
    this.pickFeatureInteraction.setActive(true);
  }
};

// metodo eseguito alla disattivazione del tool
proto.stop = function(){
  MapService.popInteraction();
  return true;
};

proto._fallBack = function(feature){
  this._busy = false;
  this.pause(false);
};
