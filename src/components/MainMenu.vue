<template>
  <div style="width: 250px">
    <q-input v-model="searchTerm" label="Search Generators" />
    <q-list style="width: 250px">
      <q-item v-for="(generator, index) in filteredGenerators" :key="index" style="width: 250px">
        <q-card>
          <div class="row justify-right" style="min-width:250px">
            <div class="col-expand">
              <q-avatar size="16px">
                <img :src="'https://oldie.veriftools.ru/media/' + generator.icon">
              </q-avatar>
            </div>
            <div class="col">
              <q-btn flat :style="{ color: index % 2 === 0 ? 'primary' : 'secondary' }" @click="handleSlugSelection(generator)">
                {{ generator.name }}
              </q-btn>
            </div>
          </div>
        </q-card>
      </q-item>
    </q-list>
  </div>
  <!-- Container for the component with a specific style -->
  <div style="width: 250px">
    <!-- List component with borders and rounded corners -->
    <q-list style="width: 250px">
      <!-- Include GenForm.vue with event handler -->
      <!-- Show the spinner if isLoading is true -->
      <q-linear-progress v-if="searchTerm" dark query color="cyan" />
      <q-linear-progress v-else-if="isLoading" dark query color="cyan" />
      <!-- Show the content if isLoading is false -->
      <q-item v-else v-for="(item, index) in menuData" :key="index" style="width: 250px"> <!-- id="`list-${id}`"> -->
        <!-- Expansion item with a specific label and model -->
        <q-expansion-item :header-inset-level="1" expand-separator  style="width: 250px" :label="truncateTitle(item.title)" v-model="item.open" :icon="`img:https://oldie.veriftools.ru/media/${item.icon}`">
          <div v-if="item.open">
            <!-- Loop through child items -->
            <div v-for="(child, childIndex) in item.child" :key="childIndex">
              <q-expansion-item :header-inset-level="-1" expand-separator style="width: 250px" :label="truncateTitle(child.title)" v-model="child.open" :icon="`img:https://oldie.veriftools.ru/media/${child.icon}`">
                <div v-if="child.open">
                  <div v-if="child.generator && child.generator.length > 0">
                    <!-- Loop through child generators -->
                    <q-card v-for="(generator, generatorIndex) in child.generator" :key="generatorIndex" :icon="`img:https://oldie.veriftools.ru/media/${generator.icon}`">
                      <q-avatar size="16px">
                        <img :src="'https://oldie.veriftools.ru/media/' + generator.icon">
                      </q-avatar>
                      <q-btn flat :style="{ color: generatorIndex % 2 === 0 ? 'primary' : '' }" @click="handleSlugSelection(generator)">
                        {{ truncateTitle(generator.name) }}
                      </q-btn>
                    </q-card>
                  </div>
                </div>
              </q-expansion-item>
            </div>
            <div v-if="item.generator && item.generator.length > 0">
              <!-- Loop through item generators -->
              <q-card v-for="(igenerator, igeneratorIndex) in item.generator" :key="igeneratorIndex" :icon="`img:https://oldie.veriftools.ru/media/${igenerator.icon}`">
                <q-avatar size="16px">
                  <img :src="'https://oldie.veriftools.ru/media/' + igenerator.icon">
                </q-avatar>
                <q-btn flat :style="{ color: igeneratorIndex % 2 === 0 ? 'primary' : '' }" @click="handleSlugSelection(igenerator)">
                  {{ truncateTitle(igenerator.name) }}
                </q-btn>
              </q-card>
            </div>
          </div>
        </q-expansion-item>
      </q-item>
    </q-list>
  </div>
</template>
<style>
.marquee {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  animation: marquee 5s linear infinite;
}

@keyframes marquee {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}
</style>
<script>
import menuData from './MenuData.json' // Import menu data from a JSON file
import { bus } from './Event-Bus' // Import bus from Event-Bus file
import { Dialog } from 'quasar';
export default {
  computed: {
    filteredGenerators() {
      let generators = [];
      if (this.searchTerm.length < 3) {
        return generators;
      }
      this.menuData.forEach(item => {
        if (item.generator && item.generator.length > 0) {
          item.generator.forEach(generator => {
            if (generator.name.toLowerCase().includes(this.searchTerm.toLowerCase())) {
              generators.push(generator);
            }
          });
        }
        if (item.child) {
          item.child.forEach(child => {
            if (child.generator && child.generator.length > 0) {
              child.generator.forEach(generator => {
                if (generator.name.toLowerCase().includes(this.searchTerm.toLowerCase())) {
                  generators.push(generator);
                }
              });
            }
          });
        }
      });
      return generators;
    }
  },
  data() {
    return {
      menuData, // Initialize menuData from imported JSON
      isLoading: false, // Initialize isLoading as false
      searchTerm: '', // Initialize searchTerm as empty string
    }
  },
  created() {

  },
  methods: {

    handleSlugSelection(generator) {
      bus.emit('selectedGenerator', generator);

      // Emit event with selected slug
    },
    truncateTitle(title) {
      const maxLength = 23;
      if (title.length > maxLength) {
        return title.slice(0, maxLength) + '...';
      }
      return title;
    }
  }
}
</script>
<style></style>
