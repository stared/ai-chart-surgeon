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

    // Create sample data (if not already defined in the code)
    const sampleData = [
      { value: 22, category: "Glycine", amino: "Glycine", percent: 22 },
      { value: 22, category: "Other", amino: "Other", percent: 22 },
      { value: 12, category: "Proline", amino: "Proline", percent: 12 },
      {
        value: 12,
        category: "Hydroxyproline",
        amino: "Hydroxyproline",
        percent: 12,
      },
      {
        value: 10,
        category: "Glutamic Acid",
        amino: "Glutamic Acid",
        percent: 10,
      },
      { value: 9, category: "Arginine", amino: "Arginine", percent: 9 },
      { value: 8, category: "Alanine", amino: "Alanine", percent: 8 },
      {
        value: 6,
        category: "Aspartic Acid",
        amino: "Aspartic Acid",
        percent: 6,
      },
    ];

    // Define common variables that might be used in the plot code
    const data = sampleData;

    // Create sandbox function to execute the plot code safely
    const createPlot = new Function(
      "Plot",
      "data",
      `
      try {
        return ${props.plotCode};
      } catch (e) {
        throw new Error("Plot code execution error: " + e.message);
      }
    `
    );

    // Execute the plot code and append to container
    const plot = createPlot(Plot, data);

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
  display: flex;
  align-items: center;
  justify-content: center;
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
