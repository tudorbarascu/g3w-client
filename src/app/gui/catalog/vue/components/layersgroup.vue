<template>
  <div style="border: 1px solid #ffffff33; margin: 5px">
    <h4 style="margin: 5px; font-weight: bold">{{ layersgroup.title }}</h4>
    <tristate-tree  :layerstree="node" v-for="node in layersgroup.nodes" class="item">
    </tristate-tree>
  </div>
</template>

<script>
  import tristateTree from './tristate-tree.vue';
  export default {
    name: "layersgroup",
    components: {
      'tristate-tree': tristateTree
    }
  }
</script>

<style scoped>

</style>