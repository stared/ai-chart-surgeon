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
    roast: "",
    plotCode: "",
  };
});

// Format list items with icons at the START of each line
function formatListWithIcons(content: string, icon: string): string {
  if (!content) return "";

  // If content already contains bullet points, replace them with icons
  if (content.includes("• ")) {
    const lines = content.split("\n");
    return lines
      .map((line) => {
        if (line.trim().startsWith("• ")) {
          return `<span class="list-icon">${icon}</span> ${line.replace(
            "• ",
            ""
          )}`;
        }
        return line;
      })
      .join("\n");
  }

  // Otherwise return as is with icon at start
  return `<span class="list-icon">${icon}</span> ${content}`;
}

const strengthsWithIcons = computed(() =>
  formatListWithIcons(feedbackData.value.strengths, "✓")
);
const weaknessesWithIcons = computed(() =>
  formatListWithIcons(feedbackData.value.weaknesses, "✗")
);
const suggestionsWithIcons = computed(() =>
  formatListWithIcons(feedbackData.value.suggestions, "💡")
);
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
      <section class="feedback-section roast" v-if="feedbackData.roast">
        <h3>The Roast 🔥</h3>
        <p class="roast-text">{{ feedbackData.roast }}</p>
      </section>

      <div class="feedback-grid">
        <section class="feedback-section strengths">
          <h3>Strengths</h3>
          <div
            class="list-items"
            v-html="strengthsWithIcons || 'No strengths identified'"
          ></div>
        </section>

        <section class="feedback-section weaknesses">
          <h3>Weaknesses</h3>
          <div
            class="list-items"
            v-html="weaknessesWithIcons || 'No weaknesses identified'"
          ></div>
        </section>
      </div>

      <section class="feedback-section suggestions">
        <h3>Suggested Improvements</h3>
        <div
          class="list-items"
          v-html="suggestionsWithIcons || 'No suggestions available'"
        ></div>
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
  gap: 1rem;
  margin-top: 1rem;
}

.feedback-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.feedback-section {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 0.8rem;
}

.feedback-section h3 {
  margin-top: 0;
  color: #646cff;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
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

.roast {
  background-color: rgba(255, 100, 50, 0.15);
  border-left: 4px solid #ff6432;
}

.roast-text {
  font-style: italic;
  font-weight: 500;
  line-height: 1.5;
  font-size: 1.05rem;
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  line-height: 1.3;
  font-size: 0.95rem;
}

.list-icon {
  display: inline-block;
  margin-right: 6px;
  font-weight: bold;
}

.code-section {
  background-color: rgba(30, 30, 30, 0.9);
}

.code-section h3 {
  color: #8be9fd;
}

.code-container {
  background-color: #282a36;
  border-radius: 6px;
  padding: 0;
  position: relative;
  overflow: hidden;
}

pre.code-block {
  margin: 0;
  padding: 1rem;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: "JetBrains Mono", "Fira Code", Menlo, Monaco, "Courier New",
    monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  background-color: transparent;
  color: #f8f8f2;
  overflow-x: auto;
  tab-size: 2;
}

/* Style for specific syntax elements to make code more readable */
code :deep(.keyword) {
  color: #ff79c6;
}
code :deep(.string) {
  color: #f1fa8c;
}
code :deep(.number) {
  color: #bd93f9;
}
code :deep(.function) {
  color: #50fa7b;
}
code :deep(.comment) {
  color: #6272a4;
}
</style>
