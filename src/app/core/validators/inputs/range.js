const {inherits}= require('core/utils/utils');
const Validator = require('./validator');

function RangeValidator(options={}) {
  RangeValidator.base(this, 'constructor', options);
  const {min, max} = options;
  this.validate = function(value) {
    value = 1*value;
    return value >= min && value <= max;
  }
}

inherits(RangeValidator, Validator);

module.exports =  RangeValidator;
