export const createCompiledTemplate = template => {
  const compiledTemplate = Vue.compile(template);
  return compiledTemplate;
};

export function createEventBus(){
  const emitter = new TinyEmitter();
  return {
    $on: (...args) => emitter.on(...args),
    $once: (...args) => emitter.once(...args),
    $off: (...args) => emitter.off(...args),
    $emit: (...args) => emitter.emit(...args)
  }
}
