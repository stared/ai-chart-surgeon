<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits(["file-uploaded"]);

const isDragging = ref(false);
const file = ref<File | null>(null);

function handleDrop(e: DragEvent) {
  e.preventDefault();
  isDragging.value = false;

  if (!e.dataTransfer?.files.length) return;

  const uploadedFile = e.dataTransfer.files[0];
  if (uploadedFile.type.startsWith("image/")) {
    file.value = uploadedFile;
    emit("file-uploaded", uploadedFile);
  }
}

function handleDragOver(e: DragEvent) {
  e.preventDefault();
  isDragging.value = true;
}

function handleDragLeave() {
  isDragging.value = false;
}

function handleFileInput(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files?.length) {
    file.value = input.files[0];
    emit("file-uploaded", input.files[0]);
  }
}
</script>

<template>
  <div
    class="upload-container"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    :class="{ dragging: isDragging }"
  >
    <div class="upload-content">
      <div v-if="!file">
        <h3>Drag and drop your chart here</h3>
        <p>or</p>
        <label for="file-input" class="upload-button">Select a file</label>
        <input
          id="file-input"
          type="file"
          accept="image/*"
          @change="handleFileInput"
          class="hidden-input"
        />
      </div>
      <div v-else class="file-preview">
        <p>{{ file.name }}</p>
        <button @click="file = null" class="reset-button">Reset</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-container {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s;
  background-color: rgba(255, 255, 255, 0.05);
  cursor: pointer;
}

.dragging {
  border-color: #646cff;
  background-color: rgba(100, 108, 255, 0.08);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 150px;
}

.hidden-input {
  display: none;
}

.upload-button {
  display: inline-block;
  padding: 0.6em 1.2em;
  background-color: #1a1a1a;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.25s;
}

.upload-button:hover {
  border-color: #646cff;
}

.reset-button {
  margin-top: 1rem;
  background-color: transparent;
  border: 1px solid #646cff;
}

.file-preview {
  width: 100%;
}
</style>
