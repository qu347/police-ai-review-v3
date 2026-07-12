<script setup lang="ts">
import { ref } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'

const router = useRouter()
const loading = ref(false)

router.beforeEach(() => {
  loading.value = true
})
router.afterEach(() => {
  loading.value = false
})
</script>

<template>
  <div v-if="loading" class="route-loading-bar" />
  <AppLayout>
    <RouterView />
  </AppLayout>
</template>

<style scoped>
.route-loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  width: 100%;
  z-index: 9999;
  background: linear-gradient(90deg, #00D4FF, #7C5CFC, #00D4FF);
  background-size: 200% 100%;
  animation: loading-slide .8s linear infinite;
}

@keyframes loading-slide {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
