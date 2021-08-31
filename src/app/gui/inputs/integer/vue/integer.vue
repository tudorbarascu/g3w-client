<template>
  <baseinput :state="state">
    <input :placeholder="state.default"
      @change="change"
      @input="change"
      class="form-control"
      style="width:100%"
      v-disabled="!editable"
      :class="{'input-error-validation' : notvalid}"
      v-model="state.value"
      v-slot:body
      type="number">
  </baseinput>
</template>

<script>
  const Input = require('gui/inputs/input');
  export default {
    name: "integer",
    mixins: [Input]
  }
</script>

<style scoped>

</style>