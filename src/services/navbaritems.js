/**
 * ORIGINAL SOURCE: gui/navbar/navbaritems.js@v3.4
 */
const {base, inherit} = require('core/utils/utils');
const G3WObject = require('core/g3wobject');

// service sidebar
function navbaritemsService() {
  this.state = {
    items: {
      left:[],
      right:[]
    }
  };
  this.addItem = function(item, position='right') {
    this.state.items[position].push(item);
  };

  base(this)
}

inherit(navbaritemsService, G3WObject);

export default new navbaritemsService();