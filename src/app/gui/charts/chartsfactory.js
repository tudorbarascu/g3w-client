import lineXY from './vue/c3/line/lineXY.vue';
const Chartsfactory = {
  CHARTS: {
    c3:{
      lineXY
    }
  },
  /*
  * type: <library(es:c3)>:<chartType:(es.lineXY)>
  * */
  build({type, hooks={}} = {}) {
    const [library='c3', chartType='lineXY'] = type.split(':');
    const chartVue = this.CHARTS[library][chartType];
    return Object.assign(hooks, chartVue);
  }
};


module.exports = Chartsfactory;
