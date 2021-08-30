const {inherits} = require('core/utils/utils');
const Service = require('gui/inputs/service');

function UniqueService(options={}) {
  UniqueService.base(this, 'constructor', options);
}

inherits(UniqueService, Service);

module.exports = UniqueService;
