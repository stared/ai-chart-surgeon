<script setup lang="ts">
import { ref, computed } from "vue";
import type { ChartFeedback } from "../types";

const props = defineProps<{
  isAnalyzing: boolean;
  file: File | null;
  feedback: ChartFeedback | null;
}>();

// Use computed property to get feedback data, fallback to empty values
const feedbackData = computed(() => {
  if (props.feedback) {
    return props.feedback;
  }

  // Default empty feedback for the new structure
  return {
    strengths: "",
    weaknesses: "",
    suggestions: "",
    plotCode: "",
  };
});
</script>

<template>
  <div class="feedback-container">
    <h2>Chart Analysis</h2>

    <div v-if="isAnalyzing" class="analyzing">
      <p>Analyzing your chart...</p>
      <div class="loader"></div>
    </div>

    <div v-else-if="!file" class="placeholder">
      <p>Upload a chart to get AI feedback</p>
    </div>

    <div v-else class="feedback-sections">
      <section class="feedback-section strengths">
        <h3>Strengths ✓</h3>
        <p v-html="feedbackData.strengths || 'No strengths identified'"></p>
      </section>

      <section class="feedback-section weaknesses">
        <h3>Weaknesses ✗</h3>
        <p v-html="feedbackData.weaknesses || 'No weaknesses identified'"></p>
      </section>

      <section class="feedback-section suggestions">
        <h3>Suggested Improvements 💡</h3>
        <p v-html="feedbackData.suggestions || 'No suggestions available'"></p>
      </section>

      <section class="feedback-section">
        <h3>Suggested Plot Code</h3>
        <pre class="code-block">{{
          feedbackData.plotCode || "No code generated"
        }}</pre>
      </section>
    </div>
  </div>
</template>

<style scoped>
.feedback-container {
  height: 100%;
  overflow-y: auto;
}

.analyzing,
.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-top: 1rem;
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid #646cff;
  animation: spin 1s linear infinite;
  margin-top: 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.feedback-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 1rem;
}

.feedback-section {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
}

.feedback-section h3 {
  margin-top: 0;
  color: #646cff;
  font-size: 1.2rem;
}

.strengths {
  background-color: rgba(100, 255, 100, 0.1);
  border-left: 4px solid #64ff64;
}

.weaknesses {
  background-color: rgba(255, 100, 100, 0.1);
  border-left: 4px solid #ff6464;
}

.suggestions {
  background-color: rgba(255, 255, 100, 0.1);
  border-left: 4px solid #ffff64;
}

pre {
  white-space: pre-wrap;
  word-break: break-word;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 0.75rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9rem;
  overflow-x: auto;
}

.code-block {
  background-color: rgba(100, 108, 255, 0.1);
}
</style>
