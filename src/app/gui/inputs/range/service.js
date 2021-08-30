const {inherits} = require('core/utils/utils');
const Service = require('gui/inputs/service');
const ValidatorClass = require('core/validators/inputs/range');

function RangeService(options={}) {
  const {min, max} = options.state.input.options.values[0];
  options.state.info = `[MIN: ${min} - MAX: ${max}]`;
  RangeService.base(this, 'constructor', options);
  const validator = new ValidatorClass({
    min: 1*min,
    max: 1*max
  });
  this.setValidator(validator);
}

inherits(RangeService, Service);

const proto = Service.prototype;

proto.isValueInRange = function(value, min, max) {
  return value <= max && value >= min;
};

module.exports = RangeService;
