const {inherits} = require('core/utils/utils');
const Service = require('gui/inputs/service');

function MediaService(options={}) {
  MediaService.base(this, 'constructor', options);
}

inherits(MediaService, Service);

module.exports = MediaService;
