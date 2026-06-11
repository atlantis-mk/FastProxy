<template>
  <div class="relative flex size-full flex-col overflow-hidden">
    <CtrlsBar>
      <div class="flex flex-wrap items-center justify-between gap-3 p-2">
        <div class="flex flex-wrap items-center gap-3">
          <details
            ref="presetDropdownRef"
            class="dropdown"
          >
            <summary class="btn btn-sm btn-outline min-w-40 justify-between">
              <span class="flex min-w-0 items-center gap-2">
                <QueueListIcon class="h-4 w-4 shrink-0" />
                <span class="truncate">{{ selectedPresetName }}</span>
              </span>
              <ChevronDownIcon class="h-4 w-4 shrink-0" />
            </summary>

            <div
              class="dropdown-content bg-base-100 border-base-300 z-50 mt-2 w-60 rounded-xl border p-1 shadow-xl"
            >
              <div class="flex items-center gap-2 px-2 py-1.5 text-sm font-medium">
                <QueueListIcon class="h-4 w-4" />
                配置预设
              </div>
              <div class="border-base-300 my-1 border-t" />

              <template v-if="routingPresets.length > 0">
                <button
                  v-for="preset in routingPresets"
                  :key="preset.id"
                  class="hover:bg-base-200 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm"
                  type="button"
                  @click="applyRoutingPreset(preset.id)"
                >
                  <CheckIcon
                    class="h-4 w-4 shrink-0"
                    :class="selectedPresetId === preset.id ? 'opacity-100' : 'opacity-0'"
                  />
                  <span class="truncate">{{ preset.name }}</span>
                </button>
              </template>
              <div
                v-else
                class="text-base-content/60 px-2 py-3 text-center text-sm"
              >
                暂无保存的预设
              </div>
            </div>
          </details>

          <div class="tabs-box tabs tabs-sm">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              class="tab"
              :class="activeTab === tab.key && 'tab-active'"
              @click="activeTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div
          v-if="activeTab === 'groups'"
          class="flex items-center gap-2"
        >
          <button
            class="btn btn-circle btn-sm max-sm:hidden"
            type="button"
            @click="toggleAllGroups"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              aria-hidden="true"
              data-slot="icon"
              class="h-4 w-4 transition-transform"
              :class="allGroupsCollapsed ? 'rotate-180' : ''"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m4.5 15.75 7.5-7.5 7.5 7.5"
              />
            </svg>
          </button>

          <button
            class="btn btn-sm btn-outline"
            type="button"
            @click="openAddGroupDialog"
          >
            添加分组
          </button>
        </div>

        <div
          v-else
          class="flex items-center gap-2"
        >
          <button
            class="btn btn-circle btn-sm max-sm:hidden"
            type="button"
            @click="toggleAllRuleCards"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              aria-hidden="true"
              data-slot="icon"
              class="h-4 w-4 transition-transform"
              :class="allRuleCardsCollapsed ? 'rotate-180' : ''"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m4.5 15.75 7.5-7.5 7.5 7.5"
              />
            </svg>
          </button>

          <button
            class="btn btn-sm btn-outline"
            type="button"
            @click="openAddRuleCardDialog"
          >
            添加规则
          </button>
        </div>
      </div>
    </CtrlsBar>

    <div class="min-h-0 flex-1 overflow-hidden">
      <div class="flex h-full w-full flex-col p-3">
        <div
          v-if="activeTab === 'groups'"
          class="grid h-full min-h-0 grid-cols-1 gap-4 xl:grid-cols-4"
        >
          <Draggable
            v-model="groups"
            item-key="id"
            handle=".group-drag-handle"
            :animation="150"
            ghost-class="routing-ghost"
            class="grid min-h-0 auto-rows-max grid-cols-1 content-start items-start gap-4 overflow-y-auto pr-1 md:grid-cols-2 xl:col-span-3"
          >
            <template #item="{ element: group }">
              <RoutingRuleGroupBucket
                :available-resources="resourcePool"
                :available-nodes="nodeResources"
                :group="group"
                :collapsed-ids="collapsedGroupIds"
                :can-drop-item="canDropItemIntoGroup"
                drag-group-name="routing-resource-pool"
                @add-resources="addResourcesToActiveCard"
                @delete-group="deleteGroup"
                @edit-group="openEditGroupDialog"
                @toggle-group="toggleActiveCard"
                @remove-item="removeItemFromActiveCard"
                @update-group-enabled="updateGroupEnabled"
                @update-group-items="updateGroupItems"
              />
            </template>
          </Draggable>

          <aside class="base-container flex min-h-0 flex-col p-4 xl:col-span-1">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-base font-semibold">All Resources</h2>
              </div>
              <div class="badge badge-outline">{{ resourcePool.length }}</div>
            </div>

            <Draggable
              :model-value="resourcePool"
              :sort="false"
              item-key="entryId"
              :group="{ name: 'routing-resource-pool', pull: 'clone', put: false }"
              :clone="cloneResourceReference"
              handle=".resource-drag-handle"
              :animation="150"
              ghost-class="routing-ghost"
              class="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1"
            >
              <template #item="{ element: resource }">
                <div class="border-base-300/50 bg-base-200/35 rounded-xl border px-3 py-2">
                  <div class="flex items-center gap-3">
                    <Bars3Icon
                      class="resource-drag-handle text-base-content/45 h-4 w-4 shrink-0 cursor-grab"
                    />
                    <div class="min-w-0 flex-1">
                      <div class="truncate text-sm font-medium">{{ resource.name }}</div>
                      <div class="text-base-content/55 mt-1 truncate text-xs">
                        {{ resource.type === 'group' ? 'Group resource' : resource.address }}
                      </div>
                    </div>
                    <div
                      class="badge badge-sm"
                      :class="
                        resource.type === 'group' ? 'badge-ghost' : 'badge-primary badge-outline'
                      "
                    >
                      {{ resource.type === 'group' ? 'Group' : 'Node' }}
                    </div>
                  </div>
                </div>
              </template>
            </Draggable>
          </aside>
        </div>

        <div
          v-else
          class="h-full min-h-0"
        >
          <Draggable
            v-model="ruleCards"
            item-key="id"
            handle=".rule-card-drag-handle"
            :animation="150"
            ghost-class="routing-ghost"
            class="grid h-full min-h-0 auto-rows-max grid-cols-1 content-start items-start gap-4 overflow-y-auto pr-1 md:grid-cols-2"
          >
            <template #item="{ element: card }">
              <div class="min-h-0 self-start">
                <RoutingRuleCard
                  :available-resources="resourcePool"
                  :available-rule-sets="availableRuleSetOptions"
                  :card="card"
                  :collapsed-ids="collapsedRuleCardIds"
                  @toggle-card="toggleRuleCard"
                  @edit-card="openEditRuleCardDialog"
                  @delete-card="deleteRuleCard"
                  @add-rule="addRuleToCard"
                  @remove-rule="removeRuleFromCard"
                  @update-enabled="updateRuleCardEnabled"
                  @update-outbound-target="updateRuleCardOutboundTarget"
                />
              </div>
            </template>
          </Draggable>
        </div>
      </div>
    </div>

    <DialogWrapper
      v-model="addGroupDialogOpen"
      :title="groupDialogTitle"
      box-class="max-w-lg"
      @enter="confirmAddGroup"
    >
      <div class="p-1">
        <div class="grid gap-4">
          <label class="form-control gap-2">
            <span class="label-text text-sm font-medium">{{
              activeTab === 'groups' ? '分组名称' : '规则名称'
            }}</span>
            <input
              v-model.trim="newGroupName"
              class="input input-bordered w-full"
              type="text"
              :placeholder="activeTab === 'groups' ? '例如：Video Route' : '例如：Streaming Rule'"
            />
          </label>

          <label class="form-control gap-2">
            <span class="label-text text-sm font-medium">分组类型</span>
            <select
              v-model="newGroupType"
              class="select select-bordered w-full"
            >
              <option
                v-for="option in groupTypeOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </label>

          <div class="form-control">
            <label class="flex w-full items-center justify-between gap-4">
              <span class="label-text text-sm font-medium">启用</span>
              <input
                v-model="newGroupEnabled"
                class="toggle toggle-primary"
                type="checkbox"
              />
            </label>
          </div>

          <template v-if="supportsHealthCheck">
            <label class="form-control gap-2">
              <span class="label-text text-sm font-medium">测试地址</span>
              <input
                v-model.trim="newGroupTestUrl"
                class="input input-bordered w-full"
                type="text"
                placeholder="https://www.gstatic.com/generate_204"
              />
            </label>

            <div class="grid gap-4 md:grid-cols-2">
              <label class="form-control gap-2">
                <span class="label-text text-sm font-medium">检查间隔</span>
                <input
                  v-model.trim="newGroupInterval"
                  class="input input-bordered w-full"
                  type="number"
                  min="0"
                  placeholder="300"
                />
              </label>

              <label
                v-if="newGroupType === 'url-test'"
                class="form-control gap-2"
              >
                <span class="label-text text-sm font-medium">切换容差</span>
                <input
                  v-model.trim="newGroupTolerance"
                  class="input input-bordered w-full"
                  type="number"
                  min="0"
                  placeholder="50"
                />
              </label>
            </div>

            <div class="form-control">
              <label class="flex w-full items-center justify-between gap-4">
                <span class="label-text text-sm font-medium">懒惰检查</span>
                <input
                  v-model="newGroupLazy"
                  class="toggle toggle-primary"
                  type="checkbox"
                />
              </label>
            </div>
          </template>

          <label
            v-if="newGroupType === 'load-balance'"
            class="form-control gap-2"
          >
            <span class="label-text text-sm font-medium">负载均衡策略</span>
            <select
              v-model="newGroupStrategy"
              class="select select-bordered w-full"
            >
              <option
                v-for="option in loadBalanceStrategyOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </label>

          <div class="grid min-h-12 gap-4 md:grid-cols-[auto_1fr] md:items-center">
            <label class="flex min-h-12 items-center gap-3">
              <span class="text-sm font-medium">正则</span>
              <input
                v-model="newGroupRegexEnabled"
                class="toggle toggle-primary"
                type="checkbox"
              />
            </label>

            <label
              class="form-control min-h-12 justify-center gap-2"
              :class="!newGroupRegexEnabled && 'pointer-events-none invisible'"
            >
              <input
                v-model.trim="newGroupMatchPattern"
                class="input input-bordered w-full"
                type="text"
                :disabled="!newGroupRegexEnabled"
                placeholder="输入正则或关键字匹配节点"
              />
            </label>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <button
            class="btn btn-sm"
            type="button"
            @click="closeGroupDialog"
          >
            取消
          </button>
          <button
            class="btn btn-primary btn-sm"
            type="button"
            :disabled="!canConfirmAddGroup"
            @click="confirmAddGroup"
          >
            确认
          </button>
        </div>
      </div>
    </DialogWrapper>

    <DialogWrapper
      v-model="ruleCardDialogOpen"
      :title="ruleCardDialogTitle"
      box-class="max-w-md"
      @enter="confirmRuleCardDialog"
    >
      <div class="p-1">
        <div class="grid gap-4">
          <label class="form-control gap-2">
            <span class="label-text text-sm font-medium">规则名称</span>
            <input
              v-model.trim="ruleCardName"
              class="input input-bordered w-full"
              type="text"
              placeholder="例如：Streaming Rule"
            />
          </label>

          <div class="form-control">
            <label class="flex w-full items-center justify-between gap-4">
              <span class="label-text text-sm font-medium">启用</span>
              <input
                v-model="ruleCardEnabled"
                class="toggle toggle-primary"
                type="checkbox"
              />
            </label>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-2">
          <button
            class="btn btn-sm"
            type="button"
            @click="closeRuleCardDialog"
          >
            取消
          </button>
          <button
            class="btn btn-primary btn-sm"
            type="button"
            :disabled="!ruleCardName.trim()"
            @click="confirmRuleCardDialog"
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
import CtrlsBar from '@/components/common/CtrlsBar.vue'
import RoutingRuleCard from '@/components/routing/RoutingRuleCard.vue'
import RoutingRuleGroupBucket from '@/components/routing/RoutingRuleGroupBucket.vue'
import type {
  RoutingGroupMode,
  RoutingGroupReference,
  RoutingGroupResource,
  RoutingItemReference,
  RoutingNodeReference,
  RoutingNodeResource,
} from '@/components/routing/RoutingRuleGroupBucket.vue'
import type {
  RuleSetOption,
  RoutingRuleDraft,
  RoutingRuleCardResource,
  RoutingRuleTargetReference,
} from '@/components/routing/RoutingRuleCard.vue'
import {
  fastProxyActiveProfile,
  fastProxyRepository,
  loadFastProxyWorkspace,
} from '@/store/fastproxyRepository'
import type {
  FastProxyNormalizedGroup,
  FastProxyNormalizedNode,
  FastProxyNormalizedRule,
} from '@/types/fastproxy'
import { Bars3Icon, CheckIcon, ChevronDownIcon, QueueListIcon } from '@heroicons/vue/24/outline'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Draggable from 'vuedraggable'

const { t } = useI18n()

type RoutingPresetOption = {
  groupSetIds: string[]
  id: string
  name: string
  ruleSetIds: string[]
}

const activeTab = ref<'groups' | 'rules'>('groups')
const presetDropdownRef = ref<HTMLDetailsElement | null>(null)
const selectedPresetId = ref<string | null>(null)
const collapsedGroupIds = ref<string[]>([])
const collapsedRuleCardIds = ref<string[]>([])
const addGroupDialogOpen = ref(false)
const ruleCardDialogOpen = ref(false)
const editingGroupId = ref<string | null>(null)
const editingRuleCardId = ref<string | null>(null)
const newGroupName = ref('')
const newGroupType = ref<RoutingGroupMode>('select')
const newGroupEnabled = ref(true)
const newGroupRegexEnabled = ref(false)
const newGroupMatchPattern = ref('')
const newGroupTestUrl = ref('https://www.gstatic.com/generate_204')
const newGroupInterval = ref('300')
const newGroupTolerance = ref('50')
const newGroupLazy = ref(true)
const newGroupStrategy = ref<'round-robin' | 'consistent-hashing' | 'sticky-sessions'>(
  'round-robin',
)
const ruleCardName = ref('')
const ruleCardEnabled = ref(true)
const nextEntryId = ref(1000)
const nextGroupId = ref(3)
const nextRuleCardId = ref(3)
const nextRuleLeafId = ref(6)

const tabs = computed(() => [
  { key: 'groups' as const, label: t('routingRuleGroups') },
  { key: 'rules' as const, label: t('rules') },
])

const routingPresets = computed<RoutingPresetOption[]>(() => {
  const presetMap = new Map<string, RoutingPresetOption>()
  for (const groupSet of repository.value?.groupSets || []) {
    const name = groupSet.name?.trim()
    if (!name) continue
    const current = presetMap.get(name) || {
      id: name,
      name,
      groupSetIds: [],
      ruleSetIds: [],
    }
    current.groupSetIds.push(groupSet.id)
    presetMap.set(name, current)
  }
  for (const ruleSet of repository.value?.routingRuleSets || []) {
    const name = ruleSet.name?.trim()
    if (!name) continue
    const current = presetMap.get(name) || {
      id: name,
      name,
      groupSetIds: [],
      ruleSetIds: [],
    }
    current.ruleSetIds.push(ruleSet.id)
    presetMap.set(name, current)
  }
  return [...presetMap.values()].sort((left, right) => left.name.localeCompare(right.name))
})

const selectedPreset = computed(() => {
  return routingPresets.value.find((preset) => preset.id === selectedPresetId.value) || null
})

const selectedPresetName = computed(() => {
  const selectedPreset = routingPresets.value.find((preset) => preset.id === selectedPresetId.value)
  return selectedPreset?.name ?? '配置预设'
})

const groupDialogTitle = computed(() => {
  return editingGroupId.value ? '编辑分组' : '添加分组'
})

const ruleCardDialogTitle = computed(() => {
  return editingRuleCardId.value ? '编辑规则' : '添加规则'
})

const groupTypeOptions: Array<{ label: string; value: RoutingGroupMode }> = [
  { label: '手动选择', value: 'select' },
  { label: '自动选择', value: 'url-test' },
  { label: '自动回退', value: 'fallback' },
  { label: '负载均衡', value: 'load-balance' },
]

const loadBalanceStrategyOptions = [
  { label: 'round-robin', value: 'round-robin' as const },
  { label: 'consistent-hashing', value: 'consistent-hashing' as const },
  { label: 'sticky-sessions', value: 'sticky-sessions' as const },
]

const supportsHealthCheck = computed(() => {
  return ['url-test', 'fallback', 'load-balance'].includes(newGroupType.value)
})

const repository = computed(() => fastProxyRepository.value)
const activeProfile = computed(() => fastProxyActiveProfile.value)
const profilePresetId = computed(() => {
  const profile = activeProfile.value
  if (!profile) return null

  const profileGroupSetIds = profile.groupSetIds || []
  const profileRuleSetIds = profile.ruleSetIds || []
  if (!profileGroupSetIds.length && !profileRuleSetIds.length) return null

  let bestPreset: RoutingPresetOption | null = null
  let bestScore = 0

  for (const preset of routingPresets.value) {
    const presetGroupSetIds = new Set(preset.groupSetIds)
    const presetRuleSetIds = new Set(preset.ruleSetIds)
    const matchedGroupSets = profileGroupSetIds.filter((id) => presetGroupSetIds.has(id)).length
    const matchedRuleSets = profileRuleSetIds.filter((id) => presetRuleSetIds.has(id)).length
    const score = matchedGroupSets + matchedRuleSets

    if (score > bestScore) {
      bestPreset = preset
      bestScore = score
    }
  }

  return bestPreset?.id ?? null
})
const nodeResources = ref<RoutingNodeResource[]>([])
const groups = ref<RoutingGroupResource[]>([])
const availableRuleSetOptions = computed<RuleSetOption[]>(() => {
  if (activeProfile.value?.selectedCore === 'sing-box') {
    const builtIn = (repository.value?.ruleSourceIndexes || [])
      .flatMap((index) => index.entries || [])
      .filter((entry) => Boolean(entry.files['sing-box']))
      .map((entry) => ({
        value: entry.logicalPath,
        label: entry.logicalPath,
        description: `内置 · sing-box · ${entry.files['sing-box']?.format || '-'}`,
      }))
    const custom = (repository.value?.singBoxRuleSets || []).map((item) => ({
      value: item.tag,
      label: item.name,
      description: `自定义 · ${item.tag} · ${item.sourceMode}`,
    }))
    return dedupeRuleSetOptions([...builtIn, ...custom])
  }
  const builtIn = (repository.value?.ruleSourceIndexes || [])
    .flatMap((index) => index.entries || [])
    .filter((entry) => Boolean(entry.files.mihomo))
    .map((entry) => ({
      value: entry.logicalPath,
      label: entry.logicalPath,
      description: `内置 · mihomo · ${entry.files.mihomo?.behavior || '-'} · ${entry.files.mihomo?.format || '-'}`,
    }))
  const custom = (repository.value?.mihomoRuleProviders || []).map((item) => ({
    value: item.provider,
    label: item.name,
    description: `自定义 · ${item.provider} · ${item.sourceMode}`,
  }))
  return dedupeRuleSetOptions([...builtIn, ...custom])
})

const dedupeRuleSetOptions = (items: RuleSetOption[]) => {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.value)) return false
    seen.add(item.value)
    return true
  })
}
const allGroupsCollapsed = computed(() => {
  return groups.value.length > 0 && collapsedGroupIds.value.length === groups.value.length
})

const allRuleCardsCollapsed = computed(() => {
  return ruleCards.value.length > 0 && collapsedRuleCardIds.value.length === ruleCards.value.length
})

const ruleCards = ref<RoutingRuleCardResource[]>([])

const resourcePool = computed(() => {
  const nodeEntries = nodeResources.value.map((node) => ({
    ...node,
    entryId: `palette-${node.id}`,
  }))
  const groupEntries = groups.value.map((group) => ({
    entryId: `palette-${group.id}`,
    id: group.id,
    name: group.name,
    type: 'group' as const,
  }))

  return [...nodeEntries, ...groupEntries]
})

const canConfirmAddGroup = computed(() => {
  if (!newGroupName.value.trim()) return false
  if (newGroupRegexEnabled.value && !newGroupMatchPattern.value.trim()) return false

  if (supportsHealthCheck.value) {
    if (!newGroupTestUrl.value.trim()) return false
    if (Number(newGroupInterval.value) < 0 || Number.isNaN(Number(newGroupInterval.value)))
      return false
  }

  if (newGroupType.value === 'url-test') {
    if (Number(newGroupTolerance.value) < 0 || Number.isNaN(Number(newGroupTolerance.value)))
      return false
  }

  return true
})

function createEntryId() {
  nextEntryId.value += 1
  return `entry-${nextEntryId.value}`
}

function createGroupId() {
  nextGroupId.value += 1
  return `group-${nextGroupId.value}`
}

function createRuleId() {
  nextRuleCardId.value += 1
  return `rule-card-${nextRuleCardId.value}`
}

function createNodeReference(nodeId: string): RoutingNodeReference {
  const node = nodeResources.value.find((item) => item.id === nodeId)
  if (!node) throw new Error(`Node ${nodeId} not found`)

  return {
    entryId: createEntryId(),
    id: node.id,
    name: node.name,
    type: 'node',
    address: node.address,
  }
}

function createGroupReference(groupId: string): RoutingGroupReference {
  const group = groups.value.find((item) => item.id === groupId)
  if (!group) throw new Error(`Group ${groupId} not found`)

  return {
    entryId: createEntryId(),
    id: group.id,
    name: group.name,
    type: 'group',
  }
}

function cloneResourceReference(resource: RoutingItemReference) {
  return resource.type === 'group'
    ? createGroupReference(resource.id)
    : createNodeReference(resource.id)
}

function resetEntityDialogForm() {
  editingGroupId.value = null
  newGroupName.value = ''
  newGroupType.value = 'select'
  newGroupEnabled.value = true
  newGroupRegexEnabled.value = false
  newGroupMatchPattern.value = ''
  newGroupTestUrl.value = 'https://www.gstatic.com/generate_204'
  newGroupInterval.value = '300'
  newGroupTolerance.value = '50'
  newGroupLazy.value = true
  newGroupStrategy.value = 'round-robin'
}

function closeEntityDialog() {
  addGroupDialogOpen.value = false
  resetEntityDialogForm()
}

function fillEntityDialog(target: RoutingGroupResource) {
  newGroupName.value = target.name
  newGroupType.value = target.groupType
  newGroupEnabled.value = target.enabled !== false
  newGroupRegexEnabled.value = target.regexEnabled ?? false
  newGroupMatchPattern.value = target.matchPattern ?? ''
  newGroupTestUrl.value = target.testUrl ?? 'https://www.gstatic.com/generate_204'
  newGroupInterval.value = String(target.interval ?? 300)
  newGroupTolerance.value = String(target.tolerance ?? 50)
  newGroupLazy.value = target.lazy ?? true
  newGroupStrategy.value = target.strategy ?? 'round-robin'
}

function openEditEntityDialog(entityId: string) {
  const targetGroup = groups.value.find((group) => group.id === entityId)
  if (!targetGroup) return

  editingGroupId.value = entityId
  fillEntityDialog(targetGroup)
  addGroupDialogOpen.value = true
}

function confirmEntityDialog() {
  const name = newGroupName.value.trim()
  const matchPattern = newGroupMatchPattern.value.trim()
  const testUrl = newGroupTestUrl.value.trim()
  const interval = Number(newGroupInterval.value)
  const tolerance = Number(newGroupTolerance.value)
  if (!name) return
  if (newGroupRegexEnabled.value && !matchPattern) return
  if (supportsHealthCheck.value && !testUrl) return

  const payload = {
    enabled: newGroupEnabled.value,
    groupType: newGroupType.value,
    interval: supportsHealthCheck.value ? interval : undefined,
    lazy: supportsHealthCheck.value ? newGroupLazy.value : undefined,
    matchPattern: newGroupRegexEnabled.value ? matchPattern : undefined,
    name,
    regexEnabled: newGroupRegexEnabled.value,
    strategy: newGroupType.value === 'load-balance' ? newGroupStrategy.value : undefined,
    testUrl: supportsHealthCheck.value ? testUrl : undefined,
    tolerance: newGroupType.value === 'url-test' ? tolerance : undefined,
  }

  if (editingGroupId.value) {
    const targetGroup = groups.value.find((group) => group.id === editingGroupId.value)
    if (!targetGroup) return

    Object.assign(targetGroup, payload)
  } else {
    const id = createGroupId()
    groups.value.push({
      ...payload,
      id,
      items: [],
      type: 'group',
    })
    collapsedGroupIds.value = [...collapsedGroupIds.value, id]
  }

  addGroupDialogOpen.value = false
  resetEntityDialogForm()
}

function toggleActiveCard(cardId: string) {
  const targetIds = activeTab.value === 'groups' ? collapsedGroupIds : collapsedRuleCardIds
  targetIds.value = targetIds.value.includes(cardId)
    ? targetIds.value.filter((id) => id !== cardId)
    : [...targetIds.value, cardId]
}

function removeItemFromCollection(
  collection: RoutingGroupResource[],
  parentId: string,
  entryId: string,
) {
  const target = collection.find((item) => item.id === parentId)
  if (!target) return

  const index = target.items.findIndex((item) => item.entryId === entryId)
  if (index >= 0) {
    target.items.splice(index, 1)
  }
}

function removeItemFromActiveCard(parentId: string, entryId: string) {
  removeItemFromCollection(groups.value, parentId, entryId)
}

function addResourcesToCollection(
  collection: RoutingGroupResource[],
  cardId: string,
  resources: RoutingItemReference[],
) {
  const target = collection.find((item) => item.id === cardId)
  if (!target || target.regexEnabled) return

  const newReferences = resources
    .filter((resource) => canDropItemIntoGroup(resource, cardId))
    .map((resource) => {
      return resource.type === 'group'
        ? createGroupReference(resource.id)
        : createNodeReference(resource.id)
    })

  target.items.push(...newReferences)
}

function addResourcesToActiveCard(cardId: string, resources: RoutingItemReference[]) {
  addResourcesToCollection(groups.value, cardId, resources)
}

function updateGroupItems(groupId: string, items: RoutingItemReference[]) {
  const targetGroup = groups.value.find((group) => group.id === groupId)
  if (!targetGroup) return
  targetGroup.items = items
}

function updateGroupEnabled(groupId: string, enabled: boolean) {
  const targetGroup = groups.value.find((group) => group.id === groupId)
  if (!targetGroup) return
  targetGroup.enabled = enabled
}

function groupDependsOn(
  sourceGroupId: string,
  targetGroupId: string,
  visited = new Set<string>(),
): boolean {
  if (sourceGroupId === targetGroupId) return true
  if (visited.has(sourceGroupId)) return false

  visited.add(sourceGroupId)
  const sourceGroup = groups.value.find((group) => group.id === sourceGroupId)
  if (!sourceGroup) return false

  return sourceGroup.items.some((item) => {
    return item.type === 'group' && groupDependsOn(item.id, targetGroupId, visited)
  })
}

function findCardById(cardId: string) {
  return groups.value.find((group) => group.id === cardId)
}

function canDropItemIntoGroup(item: RoutingItemReference, targetGroupId: string) {
  const targetGroup = findCardById(targetGroupId)
  if (!targetGroup) return false
  if (targetGroup.regexEnabled) return false

  const alreadyExists = targetGroup.items.some((existingItem) => {
    return existingItem.id === item.id && existingItem.type === item.type
  })

  if (alreadyExists) return false
  if (item.type !== 'group') return true
  if (item.id === targetGroupId) return false

  return !groupDependsOn(item.id, targetGroupId)
}

function toggleAllGroups() {
  collapsedGroupIds.value = allGroupsCollapsed.value ? [] : groups.value.map((group) => group.id)
}

function openAddGroupDialog() {
  resetEntityDialogForm()
  addGroupDialogOpen.value = true
}

function openEditGroupDialog(groupId: string) {
  openEditEntityDialog(groupId)
}

function closeGroupDialog() {
  closeEntityDialog()
}

function confirmAddGroup() {
  confirmEntityDialog()
}

function createRuleLeafId() {
  nextRuleLeafId.value += 1
  return `rule-leaf-${nextRuleLeafId.value}`
}

function resetRuleCardDialog() {
  editingRuleCardId.value = null
  ruleCardName.value = ''
  ruleCardEnabled.value = true
}

function openAddRuleCardDialog() {
  resetRuleCardDialog()
  ruleCardDialogOpen.value = true
}

function closePresetDropdown() {
  presetDropdownRef.value?.removeAttribute('open')
}

function applyRoutingPreset(presetId: string) {
  selectedPresetId.value = selectedPresetId.value === presetId ? null : presetId
  closePresetDropdown()
}

function openEditRuleCardDialog(cardId: string) {
  const targetCard = ruleCards.value.find((card) => card.id === cardId)
  if (!targetCard) return

  editingRuleCardId.value = cardId
  ruleCardName.value = targetCard.name
  ruleCardEnabled.value = targetCard.enabled
  ruleCardDialogOpen.value = true
}

function closeRuleCardDialog() {
  ruleCardDialogOpen.value = false
  resetRuleCardDialog()
}

function confirmRuleCardDialog() {
  const name = ruleCardName.value.trim()
  if (!name) return

  if (editingRuleCardId.value) {
    const targetCard = ruleCards.value.find((card) => card.id === editingRuleCardId.value)
    if (!targetCard) return

    targetCard.name = name
    targetCard.enabled = ruleCardEnabled.value
  } else {
    const id = createRuleId()
    ruleCards.value.push({
      enabled: ruleCardEnabled.value,
      id,
      name,
      outboundTarget: null,
      rules: [],
    })
    collapsedRuleCardIds.value = [...collapsedRuleCardIds.value, id]
  }

  ruleCardDialogOpen.value = false
  resetRuleCardDialog()
}

function toggleRuleCard(cardId: string) {
  collapsedRuleCardIds.value = collapsedRuleCardIds.value.includes(cardId)
    ? collapsedRuleCardIds.value.filter((id) => id !== cardId)
    : [...collapsedRuleCardIds.value, cardId]
}

function toggleAllRuleCards() {
  collapsedRuleCardIds.value = allRuleCardsCollapsed.value
    ? []
    : ruleCards.value.map((card) => card.id)
}

function deleteGroup(groupId: string) {
  groups.value = groups.value.filter((group) => group.id !== groupId)
  collapsedGroupIds.value = collapsedGroupIds.value.filter((id) => id !== groupId)
}

function deleteRuleCard(cardId: string) {
  ruleCards.value = ruleCards.value.filter((card) => card.id !== cardId)
  collapsedRuleCardIds.value = collapsedRuleCardIds.value.filter((id) => id !== cardId)
}

function updateRuleCardEnabled(cardId: string, enabled: boolean) {
  const targetCard = ruleCards.value.find((card) => card.id === cardId)
  if (!targetCard) return
  targetCard.enabled = enabled
}

function updateRuleCardOutboundTarget(cardId: string, target: RoutingItemReference) {
  const targetCard = ruleCards.value.find((card) => card.id === cardId)
  if (!targetCard) return

  const outboundTarget: RoutingRuleTargetReference = {
    id: target.id,
    name: target.name,
    type: target.type,
  }

  targetCard.outboundTarget = outboundTarget
  targetCard.rules = targetCard.rules.map((rule) => ({
    ...rule,
    target: target.name,
  }))
}

function addRuleToCard(cardId: string, rule: RoutingRuleDraft) {
  const targetCard = ruleCards.value.find((card) => card.id === cardId)
  if (!targetCard) return

  targetCard.rules.push({
    condition: rule.condition,
    id: createRuleLeafId(),
    target: rule.target,
    value: rule.value,
  })
}

function removeRuleFromCard(cardId: string, ruleId: string) {
  const targetCard = ruleCards.value.find((card) => card.id === cardId)
  if (!targetCard) return

  targetCard.rules = targetCard.rules.filter((rule) => rule.id !== ruleId)
}

const RULE_RESERVED_KEYS = new Set(['id', 'type', 'mode', 'rules', 'action', 'outbound', 'raw'])

function mapSingBoxGroupType(type: string): RoutingGroupMode {
  switch (type) {
    case 'selector':
      return 'select'
    case 'urltest':
      return 'url-test'
    default:
      return (type as RoutingGroupMode) || 'select'
  }
}

function getActiveNodes(): FastProxyNormalizedNode[] {
  const nodeSetIds = new Set(activeProfile.value?.nodeSetIds || [])
  const nodeSets = repository.value?.nodeSets || []
  const selectedNodeSets = nodeSetIds.size
    ? nodeSets.filter((item) => nodeSetIds.has(item.id))
    : nodeSets
  return selectedNodeSets.flatMap((item) => item.nodes || [])
}


function getActiveGroups(): FastProxyNormalizedGroup[] {
  if (selectedPreset.value) {
    const selectedIds = new Set(selectedPreset.value.groupSetIds)
    return (repository.value?.groupSets || [])
      .filter((item) => selectedIds.has(item.id))
      .flatMap((item) => item.groups || [])
  }
  const groupSetIds = new Set(activeProfile.value?.groupSetIds || [])
  const groupSets = repository.value?.groupSets || []
  const selectedGroupSets = groupSetIds.size
    ? groupSets.filter((item) => groupSetIds.has(item.id))
    : groupSets
  return selectedGroupSets.flatMap((item) => item.groups || [])
}

function getActiveRules(): FastProxyNormalizedRule[] {
  if (selectedPreset.value) {
    const selectedIds = new Set(selectedPreset.value.ruleSetIds)
    return (repository.value?.routingRuleSets || [])
      .filter((item) => selectedIds.has(item.id))
      .flatMap((item) => item.rules || [])
  }
  const ruleSetIds = new Set(activeProfile.value?.ruleSetIds || [])
  const ruleSets = repository.value?.routingRuleSets || []
  const selectedRuleSets = ruleSetIds.size
    ? ruleSets.filter((item) => ruleSetIds.has(item.id))
    : ruleSets
  return selectedRuleSets.flatMap((item) => item.rules || [])
}

function buildNodeResources(
  nodes: FastProxyNormalizedNode[],
  extraOutbounds: string[],
  groupsSource: FastProxyNormalizedGroup[],
): RoutingNodeResource[] {
  const groupTags = new Set(groupsSource.map((group) => group.tag))
  const resources = nodes.map((node) => ({
    id: node.tag,
    type: 'node' as const,
    name: node.tag,
    address: node.server || node.type,
  }))
  const knownNodeIds = new Set(resources.map((item) => item.id))
  for (const outbound of extraOutbounds) {
    if (!outbound || groupTags.has(outbound) || knownNodeIds.has(outbound)) {
      continue
    }
    resources.push({
      id: outbound,
      type: 'node',
      name: outbound,
      address: 'built-in outbound',
    })
    knownNodeIds.add(outbound)
  }
  return resources
}

function createReferenceFromTag(
  outbound: string,
  groupLookup: Map<string, { id: string; name: string }>,
  nodeLookup: Map<string, RoutingNodeResource>,
): RoutingItemReference | null {
  const group = groupLookup.get(outbound)
  if (group) {
    return {
      entryId: createEntryId(),
      id: group.id,
      name: group.name,
      type: 'group',
    }
  }
  const node = nodeLookup.get(outbound)
  if (node) {
    return {
      entryId: createEntryId(),
      id: node.id,
      name: node.name,
      type: 'node',
      address: node.address,
    }
  }
  return null
}

function buildGroupsFromSource(
  groupsSource: FastProxyNormalizedGroup[],
  nodeSource: RoutingNodeResource[],
): RoutingGroupResource[] {
  const groupLookup = new Map(
    groupsSource.map((group) => [group.tag, { id: group.id, name: group.tag }]),
  )
  const nodeLookup = new Map(nodeSource.map((node) => [node.id, node]))

  return groupsSource.map((group) => ({
    enabled: true,
    groupType: mapSingBoxGroupType(group.type),
    id: group.id,
    type: 'group',
    name: group.tag,
    regexEnabled: false,
    items: (group.outbounds || [])
      .map((outbound) => createReferenceFromTag(outbound, groupLookup, nodeLookup))
      .filter((item): item is RoutingItemReference => item !== null),
  }))
}

function getRuleFieldEntries(rule: FastProxyNormalizedRule): Array<[string, unknown]> {
  return Object.entries(rule).filter(
    ([key, value]) => !RULE_RESERVED_KEYS.has(key) && value != null,
  )
}

function formatRuleCondition(field: string): string {
  return field.replaceAll('_', '-').toUpperCase()
}

function formatRuleLeafValue(value: unknown): string | string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item))
  }
  if (typeof value === 'boolean') {
    return String(value)
  }
  if (value && typeof value === 'object') {
    return JSON.stringify(value)
  }
  return String(value)
}

function buildRuleLeafs(rule: FastProxyNormalizedRule, outboundName: string) {
  if (rule.type === 'logical') {
    return [
      {
        condition: `LOGICAL-${(rule.mode || 'or').toUpperCase()}`,
        id: createRuleLeafId(),
        target: outboundName,
        value:
          rule.rules?.map((child) => child.raw?.[0] || formatRuleCondition(child.type || 'rule')) ||
          [],
      },
    ]
  }

  const entries = getRuleFieldEntries(rule)
  if (entries.length === 0) {
    return [
      {
        condition: 'MATCH',
        id: createRuleLeafId(),
        target: outboundName,
        value: '*',
      },
    ]
  }

  return entries.map(([field, value]) => ({
    condition: formatRuleCondition(field),
    id: createRuleLeafId(),
    target: outboundName,
    value: formatRuleLeafValue(value),
  }))
}

function buildRuleCardsFromSource(
  rulesSource: FastProxyNormalizedRule[],
  groupsSource: RoutingGroupResource[],
  nodesSource: RoutingNodeResource[],
): RoutingRuleCardResource[] {
  const groupLookup = new Map(groupsSource.map((group) => [group.name, group]))
  const nodeLookup = new Map(nodesSource.map((node) => [node.name, node]))

  return rulesSource.map((rule, index) => {
    const outboundName = rule.outbound || 'direct'
    const groupTarget = groupLookup.get(outboundName)
    const nodeTarget = nodeLookup.get(outboundName)
    const outboundTarget: RoutingRuleTargetReference | null = groupTarget
      ? { id: groupTarget.id, name: groupTarget.name, type: 'group' }
      : nodeTarget
        ? { id: nodeTarget.id, name: nodeTarget.name, type: 'node' }
        : { id: outboundName, name: outboundName, type: 'node' }

    return {
      enabled: true,
      id: rule.id,
      name: rule.raw?.[0] || `Rule ${index + 1}`,
      outboundTarget,
      rules: buildRuleLeafs(rule, outboundName),
    }
  })
}

function syncRoutingWorkspace() {
  const sourceGroups = getActiveGroups()
  const sourceRules = getActiveRules()
  const sourceNodes = getActiveNodes()
  const referencedOutbounds = [
    ...sourceGroups.flatMap((group) => group.outbounds || []),
    ...sourceRules.map((rule) => rule.outbound || '').filter(Boolean),
  ]
  const nextNodes = buildNodeResources(sourceNodes, referencedOutbounds, sourceGroups)
  const nextGroups = buildGroupsFromSource(sourceGroups, nextNodes)

  nodeResources.value = nextNodes
  groups.value = nextGroups
  const nextRuleCards = buildRuleCardsFromSource(sourceRules, nextGroups, nextNodes)
  ruleCards.value = nextRuleCards
  collapsedGroupIds.value = nextGroups.map((group) => group.id)
  collapsedRuleCardIds.value = nextRuleCards.map((card) => card.id)
}

watch(
  [repository, activeProfile, selectedPresetId],
  () => {
    syncRoutingWorkspace()
  },
  { immediate: true },
)

watch(
  routingPresets,
  (presets) => {
    if (selectedPresetId.value && !presets.some((preset) => preset.id === selectedPresetId.value)) {
      selectedPresetId.value = null
      return
    }
    if (profilePresetId.value) {
      selectedPresetId.value = profilePresetId.value
      return
    }
    if (!selectedPresetId.value && presets.length === 1) {
      selectedPresetId.value = presets[0].id
    }
  },
  { immediate: true },
)

watch(profilePresetId, (presetId) => {
  if (presetId) {
    selectedPresetId.value = presetId
  }
})

onMounted(async () => {
  if (!repository.value) {
    await loadFastProxyWorkspace().catch(() => null)
  }
})
</script>

<style scoped>
.routing-ghost {
  opacity: 0.45;
}
</style>
