<template>
    <q-page class="row items-center justify-evenly">
        <example-component title="Example component" active ></example-component>
    </q-page>
</template>
<script lang="ts">

import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'IndexPage',

  setup () {

    return { };
  }
});
</script>
