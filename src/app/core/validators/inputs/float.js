const {inherits}= require('core/utils/utils');
const Validator = require('./validator');

function FloatValidator(options={}) {
  FloatValidator.base(this, 'constructor', options);
  this.validate = function(value) {
    const float = Number(1*value);
    return !Number.isNaN(float) && float <= 2147483647;
  }
}

inherits(FloatValidator, Validator);

module.exports =  FloatValidator;
