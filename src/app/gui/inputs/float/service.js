const {inherits} = require('core/utils/utils');
const Service = require('gui/inputs/service');

function FloatService(options={}) {
  FloatService.base(this, 'constructor', options);
}

inherits(FloatService, Service);

module.exports = FloatService;
