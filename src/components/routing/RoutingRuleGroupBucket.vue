<template>
  <div v-bind="attrs">
    <section class="base-container w-full p-5">
      <div class="flex items-start justify-between gap-4">
        <div class="flex min-w-0 flex-1 items-center gap-3">
          <Bars3Icon class="group-drag-handle text-base-content/45 h-4 w-4 shrink-0 cursor-grab" />
          <button
            class="flex min-w-0 flex-1 items-center gap-3 text-left"
            type="button"
            @click="$emit('toggle-group', group.id)"
          >
            <ChevronRightIcon
              class="h-4 w-4 shrink-0 transition-transform"
              :class="!isCollapsed && 'rotate-90'"
            />
            <div class="flex min-w-0 items-center gap-2">
              <h2 class="truncate text-lg font-semibold">{{ group.name }}</h2>
              <span class="text-base-content/55 shrink-0 text-xs tabular-nums">
                {{ displayedItemsCount }}
              </span>
            </div>
          </button>
        </div>

        <div class="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <button
            class="btn btn-sm btn-outline"
            type="button"
            @click="$emit('edit-group', group.id)"
          >
            编辑
          </button>
          <button
            class="btn btn-sm btn-outline"
            type="button"
            @click="$emit('delete-group', group.id)"
          >
            删除
          </button>
          <button
            class="btn btn-sm btn-outline"
            type="button"
            :disabled="group.regexEnabled"
            @click="openAddNodesDialog"
          >
            添加节点
          </button>
          <label class="flex items-center">
            <input
              :checked="group.enabled !== false"
              class="toggle toggle-primary toggle-sm"
              type="checkbox"
              @change="emitGroupEnabled(($event.target as HTMLInputElement).checked)"
            />
          </label>
        </div>
      </div>

      <div
        v-if="!isCollapsed"
        class="mt-4"
      >
        <div
          v-if="group.regexEnabled"
          class="space-y-3"
        >
          <div
            v-for="node in matchedNodes"
            :key="node.id"
            class="border-base-300/50 bg-base-200/35 rounded-2xl border p-4"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="min-w-0">
                <div class="truncate text-sm font-medium">{{ node.name }}</div>
                <div class="text-base-content/55 mt-1 truncate text-xs">{{ node.address }}</div>
              </div>
              <div class="badge badge-primary badge-outline badge-sm">Node</div>
            </div>
          </div>

          <div
            v-if="matchedNodes.length === 0"
            class="text-base-content/55 py-8 text-center text-sm"
          >
            没有匹配的节点
          </div>
        </div>

        <Draggable
          v-else
          :model-value="group.items"
          @update:model-value="updateItems"
          item-key="entryId"
          :group="{ name: dragGroupName, pull: true, put: true }"
          :move="handleMove"
          handle=".resource-drag-handle"
          :animation="150"
          ghost-class="routing-ghost"
          class="space-y-3"
        >
          <template #item="{ element: item }">
            <div class="border-base-300/50 bg-base-200/35 rounded-2xl border p-4">
              <div class="flex items-center justify-between gap-3">
                <div class="flex min-w-0 items-center gap-3">
                  <Bars3Icon
                    class="resource-drag-handle text-base-content/45 h-4 w-4 shrink-0 cursor-grab"
                  />
                  <div class="min-w-0">
                    <div class="truncate text-sm font-medium">{{ item.name }}</div>
                    <div class="text-base-content/55 mt-1 truncate text-xs">
                      {{ item.type === 'group' ? 'Group resource' : item.address }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <div
                    class="badge badge-sm"
                    :class="item.type === 'group' ? 'badge-ghost' : 'badge-primary badge-outline'"
                  >
                    {{ item.type === 'group' ? 'Group' : 'Node' }}
                  </div>
                  <button
                    class="btn btn-circle btn-ghost btn-xs"
                    type="button"
                    @click="$emit('remove-item', group.id, item.entryId)"
                  >
                    <XMarkIcon class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </template>
        </Draggable>
      </div>
    </section>

    <DialogWrapper
      v-model="addResourcesDialogOpen"
      title="添加资源"
      box-class="max-w-2xl"
    >
      <div class="space-y-4">
        <input
          v-model.trim="resourceSearch"
          class="input input-bordered w-full"
          type="text"
          placeholder="搜索节点或分组"
        />

        <div class="flex items-center justify-between gap-3">
          <div class="text-base-content/60 text-sm">
            可选 {{ selectableResources.length }} 个，已选 {{ selectedResourceKeys.length }} 个
          </div>
          <div class="flex items-center gap-2">
            <button
              class="btn btn-sm btn-ghost"
              type="button"
              @click="selectAllResources"
            >
              全选
            </button>
            <button
              class="btn btn-sm btn-ghost"
              type="button"
              @click="clearSelectedResources"
            >
              取消全选
            </button>
          </div>
        </div>

        <div
          class="border-base-300/60 max-h-[420px] space-y-2 overflow-y-auto rounded-2xl border p-2"
        >
          <label
            v-for="resource in filteredResources"
            :key="getResourceSelectionKey(resource)"
            class="border-base-300/50 bg-base-200/25 flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2"
            :class="!isResourceSelectable(resource) && 'opacity-45'"
          >
            <input
              v-model="selectedResourceKeys"
              class="checkbox checkbox-sm"
              type="checkbox"
              :value="getResourceSelectionKey(resource)"
              :disabled="!isResourceSelectable(resource)"
            />
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm font-medium">{{ resource.name }}</div>
              <div class="text-base-content/55 truncate text-xs">
                {{ resource.type === 'group' ? 'Group resource' : resource.address }}
              </div>
            </div>
            <div
              class="badge badge-sm"
              :class="resource.type === 'group' ? 'badge-ghost' : 'badge-primary badge-outline'"
            >
              {{ resource.type === 'group' ? 'Group' : 'Node' }}
            </div>
          </label>

          <div
            v-if="filteredResources.length === 0"
            class="text-base-content/55 py-8 text-center text-sm"
          >
            没有匹配的资源
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <button
            class="btn btn-sm"
            type="button"
            @click="addResourcesDialogOpen = false"
          >
            取消
          </button>
          <button
            class="btn btn-primary btn-sm"
            type="button"
            :disabled="selectedResourceKeys.length === 0"
            @click="confirmAddResources"
          >
            确认
          </button>
        </div>
      </div>
    </DialogWrapper>
  </div>
</template>

<script setup lang="ts">
import DialogWrapper from '@/components/common/DialogWrapper.vue'
import { Bars3Icon, ChevronRightIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { computed, ref, useAttrs } from 'vue'
import Draggable from 'vuedraggable'

defineOptions({
  inheritAttrs: false,
})

export type RoutingNodeResource = {
  address: string
  id: string
  name: string
  type: 'node'
}

export type RoutingGroupReference = {
  entryId: string
  id: string
  name: string
  type: 'group'
}

export type RoutingNodeReference = {
  address: string
  entryId: string
  id: string
  name: string
  type: 'node'
}

export type RoutingItemReference = RoutingGroupReference | RoutingNodeReference

export type RoutingGroupMode = 'select' | 'url-test' | 'fallback' | 'load-balance' | 'relay'

export type RoutingGroupResource = {
  enabled?: boolean
  groupType: RoutingGroupMode
  id: string
  items: RoutingItemReference[]
  interval?: number
  lazy?: boolean
  matchPattern?: string
  name: string
  raw?: Record<string, unknown>
  regexEnabled?: boolean
  strategy?: 'round-robin' | 'consistent-hashing' | 'sticky-sessions'
  testUrl?: string
  tolerance?: number
  type: 'group'
}

const props = defineProps<{
  availableResources: RoutingItemReference[]
  availableNodes: RoutingNodeResource[]
  canDropItem: (item: RoutingItemReference, targetGroupId: string) => boolean
  collapsedIds: string[]
  dragGroupName: string
  group: RoutingGroupResource
}>()

const emit = defineEmits<{
  'add-resources': [groupId: string, resources: RoutingItemReference[]]
  'delete-group': [groupId: string]
  'edit-group': [groupId: string]
  'remove-item': [parentId: string, entryId: string]
  'toggle-group': [groupId: string]
  'update-group-enabled': [groupId: string, enabled: boolean]
  'update-group-items': [groupId: string, items: RoutingItemReference[]]
}>()

const attrs = useAttrs()

const isCollapsed = computed(() => props.collapsedIds.includes(props.group.id))
const addResourcesDialogOpen = ref(false)
const resourceSearch = ref('')
const selectedResourceKeys = ref<string[]>([])

const matchedNodes = computed(() => {
  const pattern = props.group.matchPattern?.trim()
  if (!pattern) {
    return []
  }

  try {
    const regex = new RegExp(pattern, 'i')
    return props.availableNodes.filter((node) => regex.test(node.name) || regex.test(node.address))
  } catch {
    const keyword = pattern.toLowerCase()
    return props.availableNodes.filter((node) => {
      return (
        node.name.toLowerCase().includes(keyword) || node.address.toLowerCase().includes(keyword)
      )
    })
  }
})

const displayedItemsCount = computed(() => {
  return props.group.regexEnabled ? matchedNodes.value.length : props.group.items.length
})

const existingResourceKeys = computed(() => {
  return new Set(props.group.items.map((item) => `${item.type}:${item.id}`))
})

const filteredResources = computed(() => {
  const keyword = resourceSearch.value.toLowerCase()
  if (!keyword) {
    return props.availableResources
  }

  return props.availableResources.filter((resource) => {
    const searchFields =
      resource.type === 'group' ? [resource.name] : [resource.name, resource.address]

    return searchFields.some((field) => field.toLowerCase().includes(keyword))
  })
})

const selectableResources = computed(() => {
  return filteredResources.value.filter((resource) => isResourceSelectable(resource))
})

const updateItems = (items: RoutingItemReference[]) => {
  const uniqueItems = items.filter((item, index, list) => {
    return (
      list.findIndex((candidate) => candidate.id === item.id && candidate.type === item.type) ===
      index
    )
  })

  emit('update-group-items', props.group.id, uniqueItems)
}

const handleMove = (event: {
  draggedContext: { element: RoutingItemReference }
  from: HTMLElement
  to: HTMLElement
}) => {
  if (event.from === event.to) {
    return true
  }

  return props.canDropItem(event.draggedContext.element, props.group.id)
}

function openAddNodesDialog() {
  resourceSearch.value = ''
  selectedResourceKeys.value = []
  addResourcesDialogOpen.value = true
}

function selectAllResources() {
  selectedResourceKeys.value = selectableResources.value.map((resource) =>
    getResourceSelectionKey(resource),
  )
}

function clearSelectedResources() {
  selectedResourceKeys.value = []
}

function confirmAddResources() {
  if (selectedResourceKeys.value.length === 0) return

  const resources = props.availableResources.filter((resource) => {
    return selectedResourceKeys.value.includes(getResourceSelectionKey(resource))
  })

  emit('add-resources', props.group.id, resources)
  addResourcesDialogOpen.value = false
  selectedResourceKeys.value = []
}

function emitGroupEnabled(enabled: boolean) {
  emit('update-group-enabled', props.group.id, enabled)
}

function getResourceSelectionKey(resource: RoutingItemReference) {
  return `${resource.type}:${resource.id}`
}

function isResourceSelectable(resource: RoutingItemReference) {
  if (existingResourceKeys.value.has(getResourceSelectionKey(resource))) {
    return false
  }

  return props.canDropItem(resource, props.group.id)
}
</script>

<style scoped>
.routing-ghost {
  opacity: 0.45;
}
</style>
