const ScreenshotControl = require('./screenshotcontrol');
function GeoScreenshotControl(options = {}) {
  options.name = "maptoimagegeo";
  options.tipLabel =  "Geo Screenshot";
  options.label = "\ue900";
  ScreenshotControl.call(this, options);
}

ol.inherits(GeoScreenshotControl, ScreenshotControl);

module.exports = GeoScreenshotControl;