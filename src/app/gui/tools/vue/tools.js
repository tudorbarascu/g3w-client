import vueToolsComponent from './tools.vue';
const {inherits} = require('core/utils/utils');
const GUI = require('gui/gui');
const Component = require('gui/vue/component');
const ToolsService = require('gui/tools/service');

function ToolsComponent(options={}) {
  ToolsComponent.base(this, 'constructor', options);
  const InternalComponent = Vue.extend(vueToolsComponent);
  this._service = new ToolsService(options);
  this.title = "tools";

  const internalComponent = new InternalComponent({
    toolsService: this._service
  });

  internalComponent.state = this._service.state;
  this.setInternalComponent(internalComponent, {
    events: [{name: 'visible'}]
  });

  this._setOpen = function(bool=false) {
    this.internalComponent.state.open = bool;
    bool && GUI.closeContent();
  }
}

inherits(ToolsComponent, Component);

module.exports = ToolsComponent;
