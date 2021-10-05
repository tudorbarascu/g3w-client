import Catalog from './components/catalog.vue';
const {inherits} = require('core/utils/utils');
const Component = require('gui/vue/component');
const ComponentsRegistry = require('gui/componentsregistry');
const GUI = require('gui/gui');
const Service = require('../catalogservice');

function CatalogComponent(options={}) {
  options.resizable = true;
  CatalogComponent.base(this, options);
  const {legend}  = options.config;
  this.title = "catalog";
  this.mapComponentId = options.mapcomponentid;
  const service = options.service || new Service;
  this.setService(service);
  this.setInternalComponent(new Catalog({
    service,
    legend
  }));
  this.internalComponent.state = this.getService().state;
  let listenToMapVisibility = map => {
    const mapService = map.getService();
    this.state.visible = !mapService.state.hidden;
    mapService.onafter('setHidden', hidden => {
      this.state.visible = !mapService.state.hidden;
      this.state.expanded = true;
    })
  };
  if (this.mapComponentId) {
    const map = GUI.getComponent(this.mapComponentId);
    !map && ComponentsRegistry.on('componentregistered', component =>
      (component.getId() === this.mapComponentId) && listenToMapVisibility(component))
    || listenToMapVisibility(map);
  }
}

inherits(CatalogComponent, Component);

module.exports = CatalogComponent;
