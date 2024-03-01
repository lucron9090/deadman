<template>
  <q-page>
    <GenForm  />
  </q-page>
</template>
<script lang="ts">
import GenForm from 'components/GenForm.vue';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'IndexPage',
  components: { GenForm },
});
</script>
