<script setup lang="ts">
// ================================================================
// EvidenceGraph — 证据知识图谱（AntV G6 力导向布局）
// 自动填充父容器宽度 / 高度，支持拖拽 / 缩放
// ================================================================

import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import G6 from '@antv/g6'
import type { GraphNode, GraphEdge } from '@/types'

interface Props {
  nodes?: GraphNode[]
  edges?: GraphEdge[]
}

const props = withDefaults(defineProps<Props>(), {
  nodes: () => [],
  edges: () => [],
})

const containerRef = ref<HTMLDivElement>()
let graphInstance: ReturnType<typeof G6['Graph']> | null = null

const nodeTypeStyle: Record<GraphNode['type'], { fill: string; stroke: string }> = {
  suspect:   { fill: '#1a3a5c', stroke: '#00D4FF' },
  victim:    { fill: '#3a2010', stroke: '#FF6B35' },
  witness:   { fill: '#1a3020', stroke: '#2ED573' },
  evidence:  { fill: '#1a1a2e', stroke: '#8FA4BE' },
  document:  { fill: '#2a1a3e', stroke: '#7C5CFC' },
}

function initGraph() {
  if (!containerRef.value || props.nodes.length === 0) return
  destroyGraph()

  const el = containerRef.value
  const w = el.clientWidth
  const h = el.clientHeight || 340

  // 自定义节点
  if (!G6.registerNode) {
    // already registered — skip
  }

  try {
    G6.registerNode('evidence-node', {
      draw(cfg: any, group: any) {
        const label = cfg?.label || ''
        const nt: GraphNode['type'] = cfg?.nodeType || 'evidence'
        const s = nodeTypeStyle[nt] || nodeTypeStyle.evidence
        const tw = G6.Util.getTextSize(label, 12)[0]
        const rw = tw + 28
        const rh = 28

        group.addShape('rect', {
          attrs: {
            x: -rw / 2, y: -rh / 2, width: rw, height: rh, radius: 14,
            fill: s.fill, stroke: s.stroke, lineWidth: 2, cursor: 'pointer',
          },
          name: 'node-rect',
        })
        const keyShape = group.addShape('text', {
          attrs: {
            text: label, x: 0, y: 0, fill: s.stroke, fontSize: 12,
            fontWeight: 600, textAlign: 'center', textBaseline: 'middle',
            cursor: 'pointer',
          },
          name: 'node-label',
        })
        return keyShape
      },
      getAnchorPoints() {
        return [[0, 0.5], [1, 0.5], [0.5, 0], [0.5, 1]]
      },
    }, 'single-node')
  } catch {
    // already registered, ignore
  }

  graphInstance = new G6.Graph({
    container: el,
    width: w,
    height: h,
    fitView: true,
    fitViewPadding: 20,
    layout: {
      type: 'force',
      preventOverlap: true,
      nodeStrength: -120,
      edgeStrength: 0.1,
      linkDistance: 120,
      gravity: 3,
      alpha: 1,
      alphaDecay: 0.02,
      alphaMin: 0.01,
    },
    modes: {
      default: ['drag-canvas', 'zoom-canvas', 'drag-node'],
    },
    defaultNode: { type: 'evidence-node' },
    defaultEdge: {
      type: 'polyline',
      style: { stroke: 'rgba(0,212,255,.25)', lineWidth: 1.5 },
    },
    animate: true,
    minZoom: 0.3,
    maxZoom: 3,
  })

  graphInstance.on('node:click', (e: any) => {
    console.log('[EvidenceGraph] 节点:', e.item?.getModel()?.label)
  })

  updateData()
}

function updateData() {
  if (!graphInstance) return
  graphInstance.data({
    nodes: props.nodes.map((n) => ({ id: n.id, label: n.label, nodeType: n.type })),
    edges: props.edges.map((e) => ({
      source: e.from,
      target: e.to,
      style: {
        stroke: e.type === 'contradiction' ? 'rgba(255,71,87,.4)' : 'rgba(0,212,255,.25)',
        lineDash: e.type === 'contradiction' ? [6, 4] : undefined,
      },
    })),
  })
  graphInstance.render()
}

function destroyGraph() {
  if (graphInstance) { graphInstance.destroy(); graphInstance = null }
}

onMounted(() => nextTick(initGraph))
onUnmounted(destroyGraph)

watch(() => [props.nodes, props.edges], () => nextTick(() => {
  graphInstance ? updateData() : initGraph()
}), { deep: true })
</script>

<template>
  <div ref="containerRef" class="graph-container" />
</template>

<style scoped>
.graph-container {
  width: 100%;
  height: 340px;
  background: #0F1D30;
  border-radius: 8px;
  border: 1px solid #1E3A5F;
  overflow: hidden;
}
</style>
