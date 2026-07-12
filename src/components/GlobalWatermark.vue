<script setup lang="ts">
// ================================================================
// GlobalWatermark — 防泄密全局水印组件
// 显示操作员信息 + 时间戳，覆盖整个视口
// ================================================================
</script>

<template>
  <div class="watermark-layer" aria-hidden="true">
    <div class="watermark-text">
      张警官 · 110102 · 2026-07-12 · AI卷宗审查系统 · 内部使用
    </div>
  </div>
</template>

<style scoped lang="scss">
.watermark-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.watermark-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-25deg);
  font-size: 28px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.03);
  white-space: nowrap;
  letter-spacing: 12px;
  user-select: none;
}
</style>
