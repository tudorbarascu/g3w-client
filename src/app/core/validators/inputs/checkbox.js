const {inherits}= require('core/utils/utils');
const Validator = require('./validator');

function CheckBoxValidator(options={}) {
  CheckBoxValidator.base(this, 'constructor', options);
  this.validate = function(value) {
    const values = this.options.values || [];
    return values.indexOf(value) !== -1;
  }
}

inherits(CheckBoxValidator, Validator);

module.exports =  CheckBoxValidator;
