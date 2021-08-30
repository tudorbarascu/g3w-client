const {inherits} = require('core/utils/utils');
const Service = require('gui/inputs/service');

function RadioService(options={}) {
  RadioService.base(this, 'constructor', options);
}

inherits(RadioService, Service);

module.exports = RadioService;
