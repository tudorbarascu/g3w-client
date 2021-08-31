import vueMetadataComponent from './vue/metadata.vue';
const {inherits} = require('core/utils/utils');
const Component = require('gui/vue/component');
const GUI = require('gui/gui');
const MetadataService = require('gui/metadata/metadataservice');

const MetadataComponent = function(options = {}) {
  MetadataComponent.base(this, 'constructor', options);
  const InternalComponent = Vue.extend(vueMetadataComponent);
  this.title = "sdk.metadata.title";
  const service = options.service || new MetadataService(options);
  this.setService(service);
  this._service.on('reload', () => {
    this.setOpen(false);
  });
  this.setInternalComponent = function () {
    this.internalComponent = new InternalComponent({
      service: service
    });
    this.internalComponent.state = service.state;
    return this.internalComponent;
  };
  this._setOpen = function(bool) {
    this._service.showMetadata(bool);
  };
  GUI.on('closecontent', ()=> this.state.open = false);
};

inherits(MetadataComponent, Component);

module.exports = MetadataComponent;


