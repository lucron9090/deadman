<template>
  <q-responsive :ratio="16 / 9" class="col">
    <div>
      <div class="q-pa-md q-gutter-sm">
        <q-bar dense class="text-white">
          <q-linear-progress color="warning" :value="progress" />
          <div>{{ taskStatus || "Preparing..." }} </div>
          <q-space />
          <q-icon name="near_me" />
          <div>>{{ taskStatus === 'end' ? responseStatus : '' }}</div>
        </q-bar>
        <TaskStatus :isLoading="isLoading" :isGenerating="isGenerating" :taskStatus="taskStatus" :error="error" :progress="progress" :previewImage="previewImage"/>
        <div style=" display: flex; align-items: center; justify-content: center">
          <q-spinner v-if="isLoading" color="primary" size="40px" />

          <!--<img v-if="taskStatus != 'end'" style="max-width: 250px" :src="'https://oldie.veriftools.ru/media/' + (activeGenerator ? activeGenerator.preview : 'generators/previews/SCANA_Bill_0.jpg')">
          <img v-else-if="taskStatus === 'end'" style="max-width: 250px" :src="finishedImage">-->
        </div>
        <form @submit.prevent="formSubmissionHandler">
          <q-stepper v-model="step" @finish="formSubmissionHandler">
            <q-step v-for="(step, index) in steps" :key="index" :name="step.name" :label="step.name" :title="step.name"
              :done="step.done">
              <div v-for="(field, i) in step.fields" :key="i">
                <q-input :type="mapFieldType(field.type)" :label="field.input_label"
                  :placeholder="field.input_placeholder" :name="field.input_name" v-model="field.value"
                  :rules="[val => (field.is_required && !val ? 'Field is required' : true)]" />
              </div>
              <q-stepper-navigation>
                <q-btn v-if="index !== 0" label="Back" color="secondary" @click="previousStep" />
                <q-btn :label="index === steps.length - 1 ? 'Generate' : 'Next'" color="primary"
                  @click.prevent="index === steps.length - 1 ? formSubmissionHandler() : nextStep()" />
              </q-stepper-navigation>
            </q-step>
          </q-stepper>
        </form>
      </div>
    </div>
  </q-responsive>
</template>

<script>
import TaskStatus from 'components/TaskStatus.vue';
import { defineComponent, ref, onBeforeUnmount } from 'vue'
import { Dialog, QSpinner, QResponsive, QBar, QLinearProgress, QSpace, QIcon, QBtn, QStepper, QStep, QStepperNavigation, QInput } from 'quasar';
import { bus } from './Event-Bus'
export default defineComponent({
  name: 'DynamicForm',
  components: { QSpinner, QResponsive, QBar, QLinearProgress, QSpace, QIcon, QBtn, QStepper, QStep, QStepperNavigation, QInput, TaskStatus },
  setup() {
    const alert = ref(false);
    const progress = ref(0.0);
    return {
      alert,
    }
  },
  data() {
    return {
      steps: [],
      step: null,
      isLoading: false,
      isGenerating: false,
      error: null,
      previewImage: null,
      intervalId: null,
      taskStatus: null,
      selectedGenerator: null,
      activeGenerator: null,
      loopcounter: 0, progress: 0.0 // Added loopcounter
    };

  },
  created() {
    if (!this.selectedGenerator) (this.taskStatus = "Ready.");
    bus.on('selectedGenerator', this.handleSelectedGenerator);
  },
  beforeUnmount() { // Changed from 'destroyed' for Vue 3 compatibility
    clearInterval(this.intervalId);
    bus.off('selectedGenerator', this.handleSelectedGenerator);
  },
  methods: {
    nextStep() {
      const currentIndex = this.steps.findIndex(s => s.name === this.step);
      if (currentIndex < this.steps.length - 1) {
        this.step = this.steps[currentIndex + 1].name;
      }
    },
    previousStep() {
      const currentIndex = this.steps.findIndex(s => s.name === this.step);
      if (currentIndex > 0) {
        this.step = this.steps[currentIndex - 1].name;
      }
    },
    filterSteps() {
      return this.steps.reduce((acc, step) => {
        step.fields.forEach(field => {
          acc[field.input_name] = field.value;
        });
        return acc;
      }, {});
    },
    validateForm() {
      for (let step of this.steps) {
        for (let field of step.fields) {
          if (field.is_required && !field.value) {
            return false;
          }
        }
      }
      return true;
    },

    async startPolling(taskId) {
      this.isLoading = false; // Hide the initial loading indicator
      this.isGenerating = true;
      this.taskStatus = 'Generating...'; // Show initial status
      this.progress = 0.0;
      this.loopcounter = 0;
      let queryParam = ""; // Start with an empty query parameter

      this.intervalId = setInterval(async () => {
        if (this.loopcounter >= 15) {

          try {
            const response = await fetch(`http://localhost:9000/api/frontend/result-image/${taskId}/`);// (`https://api.verifblog.com/api/frontend/result-image/${taskId}/`);
            const data = await response.json();
            if(data.folder_name) {
              this.previewImage = 'https://oldie.veriftools.ru/media/generator_item/' + data.folder_name + '/result_image.jpg';
            }
            if (data) {
              if(this.taskStatus === "Still generating")
                this.taskStatus.append(".");
              else
                this.taskStatus = data.status;

              if (this.taskStatus === 'end') {
                clearInterval(this.intervalId);
                this.isGenerating = false;
                this.previewImage = 'https://oldie.veriftools.ru/media/generator_item/' + data.folder_name + '/result_image.jpg';

              }
              else {
                this.taskStatus = "Still generating...";
                this.loopcounter = 10; //try again in 5 seconds.
              }

            }
          } catch (error) {
            this.error = error;
            clearInterval(this.intervalId);
            this.isGenerating = false; // Update state on error
            this.error = error;
          }
          this.taskStatus = this.previewImage;

        }
        else {
          this.progress = this.loopcounter / 10;
          //this.taskStatus = this.progress;
          this.loopcounter += 1;
        }
      }, 1000);

    },

    async formSubmissionHandler() {
      if (!this.validateForm()) {
        this.showErrorDialog('Error', 'Please fill in all required fields before submitting.');
        return;
      }
      this.isGenerating = true;
      try {
        const formData = new FormData();
        formData.append('generator', this.activeGenerator.id);
        formData.append('data', JSON.stringify(this.filterSteps()));
        const response = await fetch('http://localhost:9000/api/frontend/generator-item/', {
          method: 'POST',
          headers: {
            'Accept': 'application/json, text/plain, */*',
          },
          body: formData,
        });
        const data = await response.json();
        if (data && data.id) {
          this.startPolling(data.id); // Start the polling process
        }
      } catch (error) {
        this.error = error;
        this.isGenerating = false;
        this.showErrorDialog('Error', this.error.message);
      }
    },

    showErrorDialog(title, message) {
      Dialog.create({
        title: title,
        message: message,
      });
    },
    async handleSelectedGenerator(generator) {
      if (!generator) return (this.taskStatus = 'Ready.');
      this.taskStatus = generator.id.toString();
      this.activeGenerator = generator;
      this.isLoading = true;

      //"'https://oldie.veriftools.ru/media/' + (activeGenerator ? activeGenerator.preview : 'generators/previews/SCANA_Bill_0.jpg')"
      this.previewImage = "https://oldie.veriftools.ru/media/generators/" + this.activeGenerator.preview;
      this.steps = []; // reset steps
      try {
        const response = await fetch(`http://localhost:9000/api/integration/generator-full-information/${generator.slug}/`);
        const { steps } = await response.json();
        if (steps) {
          this.steps = steps.map(step => ({ ...step, done: false }));
          this.step = this.steps[0].name;
        } else {
          console.error('No data received from API');
        }
      } catch (error) {
        this.error = error;
      } finally {
        this.isLoading = false;
      }
    },
    mapFieldType(type) {
      const fieldTypeMap = {
        string: 'text',
        number: 'number',
      };
      return fieldTypeMap[type] || 'text';
    },
  }
})
</script>
