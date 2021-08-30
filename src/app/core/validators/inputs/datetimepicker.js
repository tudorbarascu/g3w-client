const {inherits}= require('core/utils/utils');
const Validator = require('./validator');

function DateTimePickerValidator(options={}) {
  DateTimePickerValidator.base(this, 'constructor', options);
  this.validate = function(value, options) {
    const fielddatetimeformat = options.fielddatetimeformat;
    return moment(value, fielddatetimeformat, true).isValid();
  }
}
inherits(DateTimePickerValidator, Validator);

module.exports =  DateTimePickerValidator;
