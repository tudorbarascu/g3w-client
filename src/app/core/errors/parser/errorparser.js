const {inherits} = require('core/utils/utils');
const G3WObject = require('core/g3wobject');
const ErrorParser = function() {
  ErrorParser.base(this, 'constructor');
};

inherits(ErrorParser, G3WObject);

module.export = ErrorParser;
