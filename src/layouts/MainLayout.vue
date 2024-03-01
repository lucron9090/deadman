<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container class="row wrap justify-center items-center content-center">
      <div class="q-pa-md justify-center content-container">

        <div class="row">
          <div class="col-shrink q-pa-md">
            <MainMenu />
          </div>
          <div class="col q-pa-md">
            <router-view />
          </div>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<style>
.content-container {
  max-width: 1440px;
  align-content:flex-start;
  width: 70%;
}
</style>

<script>
import { defineComponent, ref } from 'vue'
import MainMenu from 'components/MainMenu.vue';
export default defineComponent({
  name: 'MainLayout',

  components: {
    MainMenu,
  },


  setup() {
    const leftDrawerOpen = ref(false)
    const rightDrawerOpen = ref(false)

    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },

      rightDrawerOpen,
      toggleRightDrawer() {
        rightDrawerOpen.value = !rightDrawerOpen.value
      }
    }
  }
});

</script>
