const Input = require('gui/inputs/input');

const FloatInput = Vue.defineComponent({
  mixins: [Input],
  template: require('./float.html')
});

module.exports = FloatInput;
