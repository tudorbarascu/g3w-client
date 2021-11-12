const Input = require('gui/inputs/input');

const TextAreaInput = Vue.defineComponent({
  mixins: [Input],
  template: require('./textarea.html')
});

module.exports = TextAreaInput;
