<template>
<div>
    <div v-if="isLoading">
      Loading...
    </div>
    <div v-else-if="isGenerating">
      Generating...
    </div>
    <div v-else-if="error">
      Error: {{ error.message }}
    </div>
    <div v-else>
      Magic Hand is idle<br>
      <q-img :fit="scale-down" :src="imagePreview" />
    </div>
</div>
</template>

<script>

export default {
  props: {
    isLoading: { type: Boolean, default: false },
    isGenerating: { type: Boolean, default: false },
    progress: { type: Number, default: 0.0 },
    taskStatus: { type: String, default: ''},
    error: { type: Object, default: null },
    imagePreview: { type: String, default: 'https://oldie.veriftools.ru/media/generators/previews/SCANA_Bill_0.jpg'},
    responseStatus: { type: String, default: '' },
  }
}
</script>
