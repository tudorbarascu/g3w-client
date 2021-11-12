const Input = require('gui/inputs/input');

const TextInput = Vue.defineComponent({
  template: require('./color.html'),
  mixins: [Input]
});

module.exports = TextInput;
