const { inherits}= require('core/utils/utils');
const Validator = require('./validator');

function RadioValidator(options) {
  base(this, options);
}

inherits(RadioValidator, Validator);

module.exports = RadioValidator;
