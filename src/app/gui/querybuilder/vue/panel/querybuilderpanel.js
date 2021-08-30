const {inherits} = require('core/utils/utils');
const Panel = require('gui/panel');
const QueryBuilder = require('gui/querybuilder/vue/querybuilder');

function QueryBuilderPanel(options={}) {
  options.title = 'Query Builder';
  QueryBuilderPanel.base(this, 'constructor', options);
  const internalPanel = new QueryBuilder(options);
  this.setInternalPanel(internalPanel);
}

inherits(QueryBuilderPanel, Panel);

module.exports = QueryBuilderPanel;
