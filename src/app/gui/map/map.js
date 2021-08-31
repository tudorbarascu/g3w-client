import mapVueComponent from './vue/map.vue';
const { merge, inherits} = require('core/utils/utils');
const Component = require('gui/vue/component');
const MapService = require('./mapservice');

function MapComponent(options = {}) {
  const InternalComponent = Vue.extend(mapVueComponent);
  MapComponent.base(this, 'constructor', options);
  this.id = "map-component";
  this.title = "Map Component";
  const target = options.target || "map";
  const maps_container = options.maps_container || "g3w-maps";
  options.target = target;
  options.maps_container = maps_container;
  this.setService(new MapService(options));
  merge(this, options);
  this.internalComponent = new InternalComponent({
    service: this._service,
    target,
    maps_container
  });
}

inherits(MapComponent, Component);

const proto = MapComponent.prototype;

proto.layout = function(width, height) {
  $(`#${this.target}`).height(height);
  $(`#${this.target}`).width(width);
  this._service.layout({width, height});
};

module.exports =  MapComponent;

