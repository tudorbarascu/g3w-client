const {inherits} = require('core/utils/utils');
const Component = require('gui/vue/component');
import ProjectCatalog from './project.vue'

function ProjectMetadataComponent({state = {}, service} = {}) {
  ProjectMetadataComponent.base(this, 'constructor');
  const vueComponent = Vue.extend(ProjectCatalog);
  this.setService(service);
  this.internalComponent = new vueComponent({
    state
  });
  this.layout = function() {};
}

inherits(ProjectMetadataComponent, Component);

module.exports = ProjectMetadataComponent;
