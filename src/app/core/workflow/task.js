const {inherits} = require('core/utils/utils');
const G3WObject = require('core/g3wobject');

function Task(options={}) {
  Task.base(this, 'constructor', options);
  this.state = {
    usermessagesteps: {}
  };
}

inherits(Task, G3WObject);

const proto = Task.prototype;


proto.revert = function() {
  console.log('Revert to implemente ');
};

proto.panic = function() {
  console.log('Panic to implement ..');
};

proto.stop = function() {
  console.log('Task Stop to implement ..');
};

proto.run = function() {
  console.log('Wrong. This method has to be overwrite from task');
};

proto.setRoot = function(task) {
  this.state.root = task;
};

proto.getUserMessageSteps = function() {
  return this.state.usermessagesteps;
};

proto.setUserMessageSteps = function(steps={}) {
  this.state.usermessagesteps = steps;
};

proto.setUserMessageStepDone = function(type) {
  if (type) this.state.usermessagesteps[type].done = true;
};

module.exports = Task;
