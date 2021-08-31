import vuePrintPageComponent from './components/printpage.vue';
const {inherits} = require('core/utils/utils');
const Component = require('gui/vue/component');

const PrintPage = function(options={}) {
  PrintPage.base(this, 'constructor');
  const InternalComponent = Vue.extend(vuePrintPageComponent);
  const {service} = options;
  this.setService(service);
  const internalComponent = new InternalComponent({
    service
  });
  this.setInternalComponent(internalComponent);
  this.internalComponent.state = service.state.output;
  this.unmount = function() {
    this.getService().setPrintAreaAfterCloseContent();
    return PrintPage.base(this, 'unmount')
  }
};

inherits(PrintPage, Component);


module.exports = PrintPage;


