<script setup lang="ts">
defineProps<{
  file: File | null;
}>();

function getImageUrl(file: File): string {
  return URL.createObjectURL(file);
}
</script>

<template>
  <div class="chart-display">
    <h2>Original Chart</h2>
    <div v-if="file" class="image-container">
      <img :src="getImageUrl(file)" alt="Uploaded chart" class="chart-image" />
    </div>
    <div v-else class="placeholder">
      <p>Upload a chart to see it here</p>
    </div>
  </div>
</template>

<style scoped>
.chart-display {
  margin-bottom: 2rem;
}

.image-container {
  margin-top: 1rem;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.chart-image {
  width: 100%;
  height: auto;
  display: block;
}

.placeholder {
  margin-top: 1rem;
  padding: 2rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: #ccc;
}
</style>
