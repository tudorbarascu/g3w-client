const Input = require('gui/inputs/input');

const IntegerInput = Vue.defineComponent({
  mixins: [Input],
  template: require('./integer.html')
});

module.exports = IntegerInput;
