const {inherits}= require('core/utils/utils');
const Validator = require('./validator');

function RadioValidator(options={}) {
  RadioValidator.base(this, 'constructor', options);
}

inherits(RadioValidator, Validator);

module.exports = RadioValidator;
