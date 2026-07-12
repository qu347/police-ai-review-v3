<script setup lang="ts">
defineProps<{
  label: string
  value: number
  change: string
  changeType: 'up' | 'down'
  icon: string
  iconClass: 'blue' | 'orange' | 'green' | 'red'
  valueSuffix?: string
  valueSuffixColor?: string
}>()
</script>

<template>
  <div class="stat-card">
    <div class="stat-label">{{ label }}</div>
    <div class="stat-value">
      {{ value }}
      <span v-if="valueSuffix" :style="{ color: valueSuffixColor, fontSize: '14px' }">{{ valueSuffix }}</span>
    </div>
    <div class="stat-change" :class="changeType">{{ change }}</div>
    <div class="stat-icon" :class="iconClass">{{ icon }}</div>
  </div>
</template>

<style scoped lang="scss">
.stat-card {
  background: #162540;
  border: 1px solid #1E3A5F;
  border-radius: 8px;
  padding: 16px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: 0.2s ease;

  &:hover {
    border-color: #00D4FF;
    box-shadow: 0 0 16px rgba(0,212,255,.15);
  }
}

.stat-label {
  font-size: 12px;
  color: #5A7290;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #E8EDF5;
}

.stat-change {
  font-size: 11px;
  margin-top: 4px;

  &.up { color: #2ED573; }
  &.down { color: #FF4757; }
}

.stat-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;

  &.blue { background: rgba(0,212,255,.15); color: #00D4FF; }
  &.orange { background: rgba(255,107,53,.15); color: #FF6B35; }
  &.green { background: rgba(46,213,115,.15); color: #2ED573; }
  &.red { background: rgba(255,71,87,.15); color: #FF4757; }
}
</style>
