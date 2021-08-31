<template>
  <li class="tree-item" @contextmenu.prevent.stop="showLayerMenu(layerstree, $event)" @click.prevent="select"
    :class="{selected: !isFolder || !isTable ? layerstree.selected : false, itemmarginbottom: !isFolder,  disabled: isDisabled, group: isFolder  }">
    <span v-if="isFolder"
      style="padding-right: 2px;"
      :class="[{bold : isFolder}, layerstree.expanded ? g3wtemplate.getFontClass('caret-down') : g3wtemplate.getFontClass('caret-right')]"
      @click="expandCollapse"
      class="root collapse-expande-collapse-icon">
    </span>
    <span v-if="isFolder"
      @click.stop="toggle(true)"
          style="color: #ffffff"
          :class="[triClass()]">
    </span>
    <span v-else-if="isTable"
          v-show="!layerstree.hidden"
          :style="{paddingLeft: !layerstree.exclude_from_legend && legendplace === 'toc' ? '18px' : '25px'}"
          :class="[parentFolder ? 'child' : 'root', g3wtemplate.getFontClass('table')]">
    </span>
    <template v-else>
      <span style="color: red" v-if="layerstree.external && layerstree.removable"
        :class="g3wtemplate.getFontClass('trash')" @click="removeExternalLayer(layerstree.name)">
      </span>
      <span style="color: #ffffff; margin-left: 5px;" v-if="layerstree.external && layerstree.download"
        :class="g3wtemplate.getFontClass('download')" @click="downloadExternalLayer(layerstree.download)">
      </span>
        <span v-show="!layerstree.hidden" class="checkbox-layer" :class="parentFolder ? 'child' : 'root'">
        <span class="collapse-expande-collapse-icon" v-if="this.legendlayerposition === 'toc'"
          @click.stop="()=> layerstree.legend.show = !layerstree.legend.show" :class="g3wtemplate.getFontClass(layerstree.legend.show ? 'caret-down' : 'caret-right')">
        </span>
        <span :style="{paddingLeft: this.legendlayerposition === 'toc' ? '5px' : (!layerstree.legend && layerstree.external) ? '0' :
           (legendplace === 'toc') ? '19px' : '26px'}" @click.stop="toggle(false)"
           :class="[g3wtemplate.getFontClass(layerstree.checked ? 'check': 'uncheck'), {'toc-added-external-layer':(!layerstree.legend && layerstree.external)}]">
        </span>
      </span>
    </template>
    <div v-show="!layerstree.hidden || isFolder" class="tree-node-title" :class="{disabled: layerstree.disabled, bold: isFolder}">
      <span :class="{highlightlayer: isHighLight, scalevisibility: showscalevisibilityclass}" class="skin-tooltip-top"
        data-placement="top" :current-tooltip="showScaleVisibilityToolip ? `minscale:${layerstree.minscale} - maxscale: ${layerstree.maxscale}` : ''"
        v-t-tooltip.text = "showScaleVisibilityToolip ? `minscale:${layerstree.minscale} - maxscale:${layerstree.maxscale}` : ''">
        {{ layerstree.title }}
      </span>
      <div v-if="(!isFolder && !layerstree.external)">
        <span v-if="layerstree.selection.active" class="action-button skin-tooltip-left selection-filter-icon" data-placement="left" data-toggle="tooltip" :class="g3wtemplate.getFontClass('success')" @click.caputure.prevent.stop="clearSelection" v-t-tooltip.create="'layer_selection_filter.tools.clear'"></span>
        <span v-if="layerstree.selection.active || layerstree.filter.active" class="action-button skin-tooltip-left selection-filter-icon" data-placement="left" data-toggle="tooltip" :class="[g3wtemplate.getFontClass('filter'), layerstree.filter.active ? 'active' : '']" @click.caputure.prevent.stop="toggleFilterLayer" v-t-tooltip.create="'layer_selection_filter.tools.filter'"></span>
      </div>
    </div>
    <layerlegend v-if="this.legendlayerposition === 'toc'" :layer="layerstree"></layerlegend>
    <ul v-if="isFolder" class="tree-content-items" :class="[`g3w-lendplace-${legendplace}`, {root: root}]" v-show="layerstree.expanded">
      <tristate-tree
        :root="false"
        :legendConfig="legend"
        :legendplace="legendplace"
        :highlightlayers="highlightlayers"
        :parentFolder="isFolder"
        :layerstree="_layerstree"
        :storeid="storeid"
        :parent="layerstree"
        :parent_mutually_exclusive="!!layerstree.mutually_exclusive"
        v-for="_layerstree in layerstree.nodes" :key="layerstree.id">
      </tristate-tree>
    </ul>
  </li>
</template>
<script>
  import LayerLegend from "./layerlegend.vue";
  import CatalogEventHub from "../../catalogeventhub";
  const GUI = require('gui/gui');
  export default {
    name: "tristate-tree",
    props : ['layerstree', 'storeid', 'legend', 'legendplace', 'highlightlayers', 'parent_mutually_exclusive', 'parentFolder', 'externallayers', 'root', 'parent'],
    components: {
      'layerlegend': LayerLegend
    },
    data() {
      return {
        expanded: this.layerstree.expanded,
        isFolderChecked: true,
        controltoggled: false,
        n_childs: null,
        filtered: false
      }
    },
    computed: {
      isFolder() {
        return !!this.layerstree.nodes
      },
      legendlayerposition(){
        return !this.layerstree.exclude_from_legend && this.legendplace === 'toc' && this.layerstree.visible && this.layerstree.legend ? 'toc' : 'tab';
      },
      showscalevisibilityclass(){
        return !this.isFolder && this.layerstree.scalebasedvisibility
      },
      showScaleVisibilityToolip(){
        return this.showscalevisibilityclass && this.isDisabled && this.layerstree.checked;
      },
      isTable() {
        return !this.isFolder && !this.layerstree.geolayer && !this.layerstree.external;
      },
      isHidden() {
        return this.layerstree.hidden && (this.layerstree.hidden === true);
      },
      selected() {
        this.layerstree.selected = this.layerstree.disabled && this.layerstree.selected ? false : this.layerstree.selected;
      },
      isHighLight() {
        const id = this.layerstree.id;
        return this.highlightlayers && !this.isFolder && CatalogLayersStoresRegistry.getLayerById(id).getTocHighlightable() && this.layerstree.visible;
      },
      isDisabled() {
        return (!this.isFolder && !this.isTable && !this.layerstree.checked) || this.layerstree.disabled || this.layerstree.groupdisabled
      }
    },
    watch:{
      'layerstree.disabled'(bool) {
        this.layerstree.selected = bool && this.layerstree.selected ? false : this.layerstree.selected;
      },
      'layerstree.checked'(){
      }
    },
    methods: {
      toggleFilterLayer(){
        CatalogEventHub.$emit('activefiltertokenlayer', this.storeid, this.layerstree);
      },
      clearSelection(){
        CatalogEventHub.$emit('unselectionlayer', this.storeid, this.layerstree);
      },
      toggle(isFolder) {
        if (isFolder) {
          this.layerstree.checked = !this.layerstree.checked;
          this.isFolderChecked = this.layerstree.checked && !this.layerstree.disabled;
          CatalogEventHub.$emit('treenodestoogled', this.storeid, this.layerstree, this.isFolderChecked, this.parent);
        } else CatalogEventHub.$emit('treenodetoogled', this.storeid, this.layerstree, this.parent, this.parent_mutually_exclusive);
      },
      expandCollapse() {
        this.layerstree.expanded = !this.layerstree.expanded;
      },
      select() {
        if (!this.isFolder && !this.layerstree.external && !this.isTable) {
          CatalogEventHub.$emit('treenodeselected',this.storeid, this.layerstree);
        }
      },
      triClass () {
        return this.layerstree.checked ? this.g3wtemplate.getFontClass('check') : this.g3wtemplate.getFontClass('uncheck');
      },
      downloadExternalLayer(download) {
        if (download.file) {
          downloadFile(download.file);
        } else if (download.url) {}
      },
      removeExternalLayer: function(name) {
        const mapService = GUI.getComponent('map').getService();
        mapService.removeExternalLayer(name);
      },
      showLayerMenu(layerstree, evt) {
        if (!this.isFolder && (this.layerstree.openattributetable || this.layerstree.downloadable || this.layerstree.geolayer || this.layerstree.external)) {
          CatalogEventHub.$emit('showmenulayer', layerstree, evt);
        }
      }
    },
    created() {
      (this.isFolder && !this.layerstree.checked) && CatalogEventHub.$emit('treenodestoogled', this.storeid, this.layerstree, this.layerstree.checked, this.parent);
    },
    async mounted() {
      if (this.isFolder && !this.root) {
        this.layerstree.nodes.forEach(node => {
          if (this.parent_mutually_exclusive && !this.layerstree.mutually_exclusive)
            if (node.id) node.uncheckable = true;
        })
      }
      await this.$nextTick();
      $('span.scalevisibility').tooltip();
    }
  }
</script>

<style scoped>

</style>