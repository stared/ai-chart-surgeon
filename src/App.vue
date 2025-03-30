<script setup lang="ts">
import { ref } from "vue";
import FileUpload from "./components/FileUpload.vue";
import ChartDisplay from "./components/ChartDisplay.vue";
import ChartFeedback from "./components/ChartFeedback.vue";
import ChartRedo from "./components/ChartRedo.vue";
import { analyzeChart } from "./services/anthropic";
import type { ChartFeedback as ChartFeedbackType } from "./types";

const uploadedFile = ref<File | null>(null);
const isAnalyzing = ref(false);
const analysisComplete = ref(false);
const plotCode = ref("");
const feedbackData = ref<ChartFeedbackType | null>(null);

async function handleFileUploaded(file: File) {
  uploadedFile.value = file;
  isAnalyzing.value = true;
  analysisComplete.value = false;

  try {
    // In a real app, this would call an actual API
    const response = await analyzeChart(file);
    plotCode.value = response.plotCode;
    feedbackData.value = response;
    analysisComplete.value = true;
  } catch (error) {
    console.error("Error analyzing chart:", error);
    // Handle error - show error message to user
  } finally {
    isAnalyzing.value = false;
  }
}
</script>

<template>
  <main class="app-container">
    <header class="app-header">
      <h1>Chart Roast 🔥</h1>
      <p class="app-description">
        Upload your chart, get AI feedback, and see how it could be improved
      </p>
    </header>

    <div class="content-container">
      <div class="column left-column">
        <FileUpload @file-uploaded="handleFileUploaded" />

        <ChartDisplay v-if="uploadedFile" :file="uploadedFile" />

        <ChartRedo v-if="analysisComplete" :plotCode="plotCode" />
      </div>

      <div class="column right-column">
        <ChartFeedback
          :isAnalyzing="isAnalyzing"
          :file="uploadedFile"
          :feedback="feedbackData"
        />
      </div>
    </div>
  </main>
</template>

<style>
:root {
  --primary-color: #646cff;
  --background-color: #1a1a1a;
  --text-color: rgba(255, 255, 255, 0.87);
  --card-background: #242424;
  --border-color: #444;
}

body {
  margin: 0;
  min-width: 100vw;
  min-height: 100vh;
  background-color: var(--background-color);
  color: var(--text-color);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, sans-serif;
  line-height: 1.5;
}

#app {
  max-width: 1440px;
  margin: 0 auto;
  padding: 2rem;
}

.app-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.app-header {
  text-align: center;
  margin-bottom: 2rem;
}

.app-description {
  color: #ccc;
  font-size: 1.2rem;
  max-width: 800px;
  margin: 0.5rem auto 0;
}

.content-container {
  display: flex;
  gap: 2rem;
}

@media (max-width: 1000px) {
  .content-container {
    flex-direction: column;
  }
}

.column {
  flex: 1;
}

.left-column {
  display: flex;
  flex-direction: column;
}

.right-column {
  background-color: var(--card-background);
  border-radius: 8px;
  padding: 1.5rem;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  margin-top: 0;
  color: white;
}

h1 {
  font-size: 2.5rem;
  background: linear-gradient(45deg, #646cff, #ff6464);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}
</style>
