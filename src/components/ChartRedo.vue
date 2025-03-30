<script setup lang="ts">
// In a real app, this would render the Observable Plot code
// or fetch a rendered image from a server

defineProps<{
  plotCode: string;
}>();
</script>

<template>
  <div class="redo-container">
    <h2>Remade Chart</h2>
    <div v-if="plotCode" class="plot-container">
      <div class="plot-placeholder">
        <p class="plot-message">Plot would render here using Observable Plot</p>
        <pre class="plot-code">{{ plotCode }}</pre>
      </div>
    </div>
    <div v-else class="placeholder">
      <p>The AI-generated chart will appear here</p>
    </div>
  </div>
</template>

<style scoped>
.redo-container {
  margin-top: 2rem;
}

.plot-container {
  margin-top: 1rem;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.plot-placeholder {
  background-color: rgba(255, 255, 255, 0.05);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.plot-message {
  margin-bottom: 1rem;
  color: #ccc;
}

.plot-code {
  width: 100%;
  background-color: rgba(100, 108, 255, 0.1);
  padding: 1rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-break: break-word;
}

.placeholder {
  margin-top: 1rem;
  padding: 2rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}
</style>
