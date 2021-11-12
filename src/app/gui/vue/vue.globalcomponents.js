import ImageComponent from './global-components/image.vue';
import GalleryImagesComponent from './global-components/gallery.vue';
import GeospatialComponet  from './global-components/geo.vue';
import Skeleton from './global-components/skeleton.vue';
import BarLoader from './global-components/bar-loader';
import Progressbar from './global-components/progressbar';
import HelpDiv from './global-components/helpdiv.vue';
import Resize from './global-components/resize.vue'
import LayerPositions from './global-components/layerpositions.vue';
import DateTime from './global-components/datetime.vue';
import Range from './global-components/range.vue';

const GlobalComponents = {
  install(app) {
    console.log(app)
    app.component(ImageComponent.name, ImageComponent);
    app.component(GalleryImagesComponent.name, GalleryImagesComponent);
    app.component(GeospatialComponet.name, GeospatialComponet);
    app.component(BarLoader.name, BarLoader);
    app.component(Progressbar.name, Progressbar);
    app.component(Skeleton.name, Skeleton);
    app.component(HelpDiv.name, HelpDiv);
    app.component(Resize.name, Resize);
    app.component(LayerPositions.name, LayerPositions);
    app.component(DateTime.name, DateTime);
    app.component(Range.name, Range);
  }
};

module.exports = GlobalComponents;
