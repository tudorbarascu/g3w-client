const {inherits} = require('core/utils/utils');;
const Component = require('gui/vue/component');
const base = require('core/utils/utils').base;
import Layer from './layer.vue'

function LayerComponent({state = {}, service} = {}) {
  LayerComponent.base(this, 'constructor');
  const vueComponent = Vue.extend(Layer);
  this.setService(service);
  this.internalComponent = new vueComponent({
    state
  });
  this.layout = function() {};
}

inherits(LayerComponent, Component);

module.exports = LayerComponent;
