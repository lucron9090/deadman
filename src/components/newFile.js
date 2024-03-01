import { defineComponent, ref } from 'vue';
import { bus } from './Event-Bus';

export default defineComponent({
name: 'DynamicForm',

setup() {
return {
alert: ref(false),
};
},
data() {
return {
steps: [],
step: null,
isLoading: false,
isGenerating: false,
error: null,
isCurrentStepValid: false,
responseStatus: null,
intervalId: null,
taskStatus: null,
};
},
created() {
bus.on('slugSelected', this.handleSlugSelected);
},
destroyed() {
bus.off('slugSelected', this.handleSlugSelected);
if (this.intervalId) {
clearInterval(this.intervalId);
}
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
async formSubmissionHandler() {
this.isGenerating = true;
this.alert = true;

try {
const formData = new FormData();
formData.append('generator', '11'); // replace with your actual generator id
formData.append('data', JSON.stringify(this.filterSteps()));
const response = await fetch('http://localhost:9000/api/frontend/generator-item/', {
method: 'POST',
headers: {
'Accept': 'application/json, text/plain, */*',
},
body: formData,
});
const data = await response.json();

if (data) {
const taskId = data.id;

// Show the initial status modal
this.showStatusModal('Processing');

// Update the status every 3 seconds
const updateStatusInterval = setInterval(async () => {
const statusResponse = await fetch(`http://localhost:9000/api/frontend/result-image/${taskId}`);
const statusData = await statusResponse.json();

this.taskStatus = statusData.task_status;

// Update the status in the modal
this.showStatusModal(this.taskStatus);

if (this.taskStatus === 'end' || loopcounter >= 10) {
clearInterval(updateStatusInterval);
this.isGenerating = false;
}
}, 3000);

// Set a timeout to clear the interval after 30 seconds
setTimeout(() => {
clearInterval(updateStatusInterval);
this.isGenerating = false;
}, 30000);
}
} catch (error) {
this.error = error;
}
},
showGenerateModal() {
this.$q.dialog({
title: 'Generate',
message: 'Are you sure you want to generate?',
cancel: true,
persistent: true,
ok: {
label: 'Yes, generate',
color: 'primary',
handler: () => {
this.formSubmissionHandler();
}
},
cancel: {
label: 'Cancel',
color: 'negative'
}
});
},
showStatusModal(status) {
this.$q.dialog({
title: 'Generation Status',
message: `The generation task has ended with status: ${status}`,
});
},
async handleSlugSelected(slug) {
if (!slug)
return;
this.isLoading = true;
this.steps = []; // reset steps
try {
const response = await fetch(`http://localhost:9000/api/integration/generator-full-information/${slug}/`);
const { steps, id } = await response.json();
if (steps) {
this.steps = steps.map(step => ({ ...step, done: false }));
this.step = this.steps[0].name;
}
else {
console.error('No data received from API');
}
}
catch (error) {
this.error = error;
}
finally {
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
},
components: { ErrorCodes }
});
