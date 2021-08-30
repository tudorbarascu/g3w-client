const {inherits} = require('core/utils/utils');
const G3WObject = require('core/g3wobject');

//class Componet Registry (singleton)
// store all components added
function ComponentsRegistry() {
  this.components = {};
  this.registerComponent = function(component) {
    const id = component.getId();
    if (!this.components[id]) {
      this.components[id] = component;
      this.emit('componentregistered', component);
    }
  };

  this.getComponent = function(id) {
    return this.components[id];
  };

  this.getComponents = function() {
    return this.components;
  };

  this.unregisterComponent = function(id) {
    const component = this.components[id];
    if (component) {
      if (typeof component.destroy === 'function') component.destroy();
      this.components[id] = null;
    }
    return component;
  };
  ComponentsRegistry.base(this, 'constructor');
}

inherits(ComponentsRegistry, G3WObject);

module.exports = new ComponentsRegistry;
