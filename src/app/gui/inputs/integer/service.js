const {inherits} = require('core/utils/utils');
const Service = require('gui/inputs/service');

function IntegerService(options={}) {
  IntegerService.base(this, 'constructor', options);
}

inherits(IntegerService, Service);

module.exports = IntegerService;
