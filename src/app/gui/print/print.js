import vuePrintComponent from './vue/print.vue';
const {inherits} = require('core/utils/utils');
const Component = require('gui/vue/component');
const PrintService = require('gui/print/printservice');

function PrintComponent(options={}) {
  PrintComponent.base(this, 'constructor', options);
  this.title = "print";
  this.vueComponent = vuePrintComponent;
  this.internalComponent = null;
  const service = options.service || new PrintService;
  this.setService(service);
  // init service
  this._service.init();
  this.setInternalComponent = function () {
    const InternalComponent = Vue.extend(this.vueComponent);
    this.internalComponent = new InternalComponent({
      service
    });
    this.state.visible = service.state.visible;
    this.internalComponent.state = service.state;
    return this.internalComponent;
  };

  this._reload = function() {
    const service = this.getService();
    service.reload();
    this.state.visible = service.state.visible;
  };

  this._setOpen = function(bool) {
    this._service.showPrintArea(bool);
  };
}

inherits(PrintComponent, Component);

module.exports = PrintComponent;


