<template>
  <div :id="maps_container">
    <div v-for="hidemap in hidemaps" :id="hidemap.id" :key="hidemap.id" class="g3w-map hidemap"></div>
    <div :id="target" class="g3w-map">
      <div class="g3w-map-controls" v-disabled="disableMapControls" ref="g3w-map-controls" :class="mapcontrolsalignement">
      </div>
      <div style="display: none;">
        <div id="marker"></div>
      </div>
      <addlayer :service="service"></addlayer>
    </div>
    <div id="map_footer" class="skin-border-color">
      <div id="map_footer_left"></div>
      <div id="map_footer_right" style="display: flex;">
        <div id="scale-control"></div>
        <div id="mouse-position-control"></div>
        <div id="permalink" data-toggle="tooltip" data-placement="top" class="skin-tooltip-top" v-t-tooltip="'sdk.tooltips.copy_map_extent_url'"
             style="background-color: #eeeeee">
          <span class="skin-color" :class="g3wtemplate.getFontClass('link')" @click="createCopyMapExtentUrl"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import AddLayerComponent from './components/addlayer.vue';
  export default {
    name: "map",
    data() {
      const {service, target} = this.$options;
      return {
        ready: false,
        target,
        maps_container: this.$options.maps_container,
        service,
        hidemaps: service.state.hidemaps
      }
    },
    components: {
      'addlayer': AddLayerComponent
    },
    computed: {
      mapcontrolsalignement() {
        return this.service.state.mapcontrolsalignement;
      },
      disableMapControls(){
        return this.service.state.mapControl.disabled;
      }
    },
    methods: {
      showHideControls() {
        const mapControls = this.$options.service.getMapControls();
        mapControls.forEach(control => control.type !== "scaleline" && control.control.showHide());
      },
      getPermalinkUrl() {
        return this.ready ? this.$options.service.getMapExtentUrl(): null;
      },
      createCopyMapExtentUrl(){
        const mapService = this.$options.service.createCopyMapExtentUrl();
      }
    },
    async mounted() {
      const mapService = this.$options.service;
      mapService.once('ready', ()=>this.ready = true);
      this.crs = mapService.getCrs();
      await this.$nextTick();
      mapService.setMapControlsContainer($(this.$refs['g3w-map-controls']));
      $('#permalink').tooltip();
      // listen of after addHideMap
      mapService.onafter('addHideMap', async ({ratio, layers=[], mainview=false, switchable=false} = {}) => {
        await this.$nextTick();
        mapService._addHideMap({ratio, layers, mainview, switchable});
      });
    },
    destroyed() {
      this.service.clear();
    }
  }
</script>

<style scoped>

</style>