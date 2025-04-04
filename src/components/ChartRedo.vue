<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import * as Plot from "@observablehq/plot";

interface Props {
  plotCode: string;
}

const props = defineProps<Props>();
const plotContainer = ref<HTMLDivElement | null>(null);
const errorMessage = ref<string | null>(null);
const plotRendered = ref(false);

// Define emits
const emit = defineEmits(["reset"]);

// Function to handle reset/try again
function handleReset() {
  emit("reset");
}

// Function to safely render the plot
function renderPlot() {
  // Clear any previous error
  errorMessage.value = null;
  plotRendered.value = false;

  if (!props.plotCode || !plotContainer.value) return;

  try {
    // Clear any previous plot
    if (plotContainer.value) {
      plotContainer.value.innerHTML = "";
    }

    // Create sandbox function to execute the plot code safely
    const createPlot = new Function(
      "Plot",
      `
      try {
        return ${props.plotCode};
      } catch (e) {
        throw new Error("Plot code execution error: " + e.message);
      }
    `
    );

    // Execute the plot code and append to container
    const plot = createPlot(Plot);

    if (plot && plotContainer.value) {
      plotContainer.value.appendChild(plot);
      plotRendered.value = true;
    } else {
      throw new Error("Failed to create plot");
    }
  } catch (error) {
    console.error("Error rendering plot:", error);
    errorMessage.value = error instanceof Error ? error.message : String(error);
  }
}

// Render the plot when the component mounts
onMounted(() => {
  if (props.plotCode) {
    renderPlot();
  }
});

// Re-render when the plotCode changes
watch(
  () => props.plotCode,
  () => {
    renderPlot();
  }
);
</script>

<template>
  <div class="redo-container">
    <h2>Remade Chart</h2>
    <div v-if="plotCode" class="plot-container">
      <!-- Plot error display -->
      <div v-if="errorMessage" class="plot-error">
        <p class="error-title">Error rendering plot:</p>
        <p class="error-message">{{ errorMessage }}</p>
        <pre class="plot-code">{{ plotCode }}</pre>
      </div>

      <!-- Plot render container -->
      <div v-else class="plot-visualization">
        <div ref="plotContainer" class="plot-area"></div>

        <!-- Show code toggle -->
        <div class="plot-controls">
          <details class="code-details">
            <summary>View code</summary>
            <pre class="plot-code">{{ plotCode }}</pre>
          </details>
        </div>
      </div>
    </div>
    <div v-else class="placeholder">
      <p>The AI-generated chart will appear here</p>
    </div>

    <!-- Try again button -->
    <div class="try-again-container" v-if="plotCode">
      <button class="try-again-button" @click="handleReset">
        Try with another chart
      </button>
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
  background-color: white;
  color: #333;
}

.plot-visualization {
  display: flex;
  flex-direction: column;
}

.plot-area {
  width: 100%;
  padding: 1rem;
  min-height: 300px;
}

.plot-controls {
  padding: 0 1rem 1rem;
}

.code-details {
  margin-top: 1rem;
}

.code-details summary {
  cursor: pointer;
  color: #646cff;
  font-weight: 500;
  padding: 0.5rem 0;
}

.plot-error {
  background-color: rgba(255, 100, 100, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.error-title {
  color: #ff6464;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.error-message {
  margin-bottom: 1rem;
  font-family: monospace;
  padding: 0.5rem;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.plot-code {
  width: 100%;
  background-color: rgba(100, 108, 255, 0.1);
  padding: 1rem;
  border-radius: 4px;
  font-family: "JetBrains Mono", "Fira Code", Menlo, Monaco, "Courier New",
    monospace;
  font-size: 0.9rem;
  white-space: pre-wrap;
  word-break: break-word;
  color: #333;
  text-align: left;
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

.try-again-container {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}

.try-again-button {
  background: linear-gradient(45deg, #646cff, #8c84ff);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.try-again-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background: linear-gradient(45deg, #7a7fff, #9e97ff);
}

.try-again-button:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
</style>
