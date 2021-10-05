import { createCompiledTemplate } from 'gui/vue/utils';
const {inherits} = require('core/utils/utils');
const Component = require('gui/vue/component');
const compiledTemplate = createCompiledTemplate(require('./streetview.html'));

const InternalComponent = Vue.extend({
  ...compiledTemplate,
  data() {
    return {
      state: null
    }
  },
  async mounted() {
    await this.$nextTick();
    const position = this.$options.service.getPosition();
    this.$options.service.postRender(position);
  }
});

const StreetViewComponent = function(options={}) {
  StreetViewComponent.base(this, 'constructor');
  const {service} = options;
  this.setService(service);
  const internalComponent = new InternalComponent({
    service
  });
  this.setInternalComponent(internalComponent);
  this.unmount = function() {
    return StreetViewComponent.base(this, 'unmount');
  }
};

inherits(StreetViewComponent, Component);

module.exports = StreetViewComponent;


