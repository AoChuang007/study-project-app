<template>
  <div class="custom-image-component">
    <img v-if="imageUrl" :src="imageUrl" alt="Custom Image" />
    <div v-else class="placeholder">No Image</div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "CustomImageComponent",
  props: {
    imageUrl: {
      type: String,
      default: "",
    },
  },
});
</script>

<style scoped>
.custom-image-component {
  width: 100%;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-image-component img {
  max-width: 100%;
  height: auto;
}

.placeholder {
  padding: 20px;
  background: #f0f0f0;
  border-radius: 4px;
  color: #999;
}
</style>
