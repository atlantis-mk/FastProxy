<template>
  <section class="base-container w-full p-5">
    <div class="flex items-start justify-between gap-4">
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <Bars3Icon
          class="rule-card-drag-handle text-base-content/45 h-4 w-4 shrink-0 cursor-grab"
        />
        <button
          class="flex min-w-0 flex-1 items-center gap-3 text-left"
          type="button"
          @click="$emit('toggle-card', card.id)"
        >
          <ChevronRightIcon
            class="h-4 w-4 shrink-0 transition-transform"
            :class="!isCollapsed && 'rotate-90'"
          />
          <div class="flex min-w-0 items-center gap-2">
            <h2 class="truncate text-lg font-semibold">{{ cardTitle }}</h2>
            <span class="text-base-content/55 shrink-0 text-xs tabular-nums">
              {{ card.rules.length }}
            </span>
          </div>
        </button>
      </div>

      <div class="flex shrink-0 flex-wrap items-center justify-end gap-2">
        <button
          class="btn btn-sm btn-outline max-w-56 justify-start"
          type="button"
          @click="openOutboundDialog"
        >
          选择出站
        </button>
        <button
          class="btn btn-sm btn-outline"
          type="button"
          @click="$emit('edit-card', card.id)"
        >
          编辑
        </button>
        <button
          class="btn btn-sm btn-outline"
          type="button"
          @click="$emit('delete-card', card.id)"
        >
          删除
        </button>
        <button
          class="btn btn-sm btn-outline"
          type="button"
          @click="openAddRuleDialog"
        >
          添加规则
        </button>
        <label class="flex items-center">
          <input
            :checked="card.enabled"
            class="toggle toggle-primary toggle-sm"
            type="checkbox"
            @change="emit('update-enabled', card.id, ($event.target as HTMLInputElement).checked)"
          />
        </label>
      </div>
    </div>

    <div
      v-if="!isCollapsed"
      class="mt-4 space-y-3"
    >
      <div class="space-y-3">
        <div
          v-for="rule in card.rules"
          :key="rule.id"
          class="border-base-300/50 bg-base-200/35 rounded-2xl border p-4"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0 truncate text-sm font-medium">
              {{ formatRuleSummary(rule) }}
            </div>
            <button
              class="btn btn-circle btn-ghost btn-xs shrink-0"
              type="button"
              @click="$emit('remove-rule', card.id, rule.id)"
            >
              <XMarkIcon class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="card.rules.length === 0"
        class="text-base-content/55 py-8 text-center text-sm"
      >
        暂无规则
      </div>
    </div>

    <DialogWrapper
      v-model="addRuleDialogOpen"
      title="添加规则"
      box-class="max-w-2xl"
      @enter="confirmAddRule"
    >
      <div class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2">
          <label class="form-control gap-2">
            <span class="label-text text-sm font-medium">规则字段</span>
            <select
              v-model="newRuleField"
              class="select select-bordered w-full"
            >
              <option
                v-for="option in routeRuleOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </label>

          <div class="form-control gap-2">
            <span class="label-text text-sm font-medium">出站标签</span>
            <button
              class="btn btn-outline h-auto min-h-12 w-full justify-start py-2"
              type="button"
              @click="openDraftOutboundDialog"
            >
              <span class="truncate">{{ draftOutboundLabel }}</span>
            </button>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-[160px_1fr]">
          <label
            v-if="!isRuleSetField"
            class="form-control gap-2"
          >
            <span class="label-text text-sm font-medium">值类型</span>
            <select
              v-model="newRuleValueMode"
              class="select select-bordered w-full"
            >
              <option value="string">字符串</option>
              <option value="array">数组</option>
            </select>
          </label>
          <div
            v-else
            class="form-control gap-2"
          >
            <span class="label-text text-sm font-medium">原生规则集名称</span>
            <button
              class="btn btn-outline h-auto min-h-12 w-full justify-start py-2"
              type="button"
              @click="openRuleSetDialog"
            >
              <span class="truncate">{{ selectedRuleSetSummary }}</span>
            </button>
          </div>

          <label class="form-control gap-2">
            <span class="label-text text-sm font-medium">匹配值</span>
            <input
              v-if="newRuleValueMode === 'string'"
              v-show="!isRuleSetField"
              v-model.trim="newRuleValue"
              class="input input-bordered w-full"
              type="text"
              :placeholder="selectedRuleOption?.placeholder ?? '请输入规则值'"
            />
            <textarea
              v-else-if="!isRuleSetField"
              v-model.trim="newRuleValuesText"
              class="textarea textarea-bordered min-h-32 w-full"
              :placeholder="arrayValuePlaceholder"
            />
            <div
              v-else
              class="border-base-300/60 bg-base-200/25 min-h-32 rounded-2xl border p-3"
            >
              <div
                v-if="selectedRuleSetOptions.length > 0"
                class="flex flex-wrap gap-2"
              >
                <span
                  v-for="item in selectedRuleSetOptions"
                  :key="item.value"
                  class="badge badge-outline max-w-full gap-1 py-3"
                >
                  <span class="truncate">{{ item.label }}</span>
                  <button
                    class="btn btn-ghost btn-circle btn-xs"
                    type="button"
                    @click="removeSelectedRuleSet(item.value)"
                  >
                    <XMarkIcon class="h-3 w-3" />
                  </button>
                </span>
              </div>
              <div
                v-else
                class="text-base-content/55 py-6 text-center text-sm"
              >
                尚未选择规则集
              </div>
            </div>
          </label>
        </div>

        <div class="space-y-2">
          <div class="label-text text-sm font-medium">生成的 JSON</div>
          <pre class="bg-base-200 text-base-content overflow-x-auto rounded-2xl p-4 text-xs">{{
            generatedRuleJson
          }}</pre>
        </div>

        <div class="flex justify-end gap-2">
          <button
            class="btn btn-sm"
            type="button"
            @click="addRuleDialogOpen = false"
          >
            取消
          </button>
          <button
            class="btn btn-primary btn-sm"
            type="button"
            :disabled="!canConfirmAddRule"
            @click="confirmAddRule"
          >
            确认
          </button>
        </div>
      </div>
    </DialogWrapper>

    <DialogWrapper
      v-model="ruleSetDialogOpen"
      title="选择内置规则集"
      box-class="max-w-3xl"
      @enter="confirmRuleSetSelection"
    >
      <div class="space-y-4">
        <div class="grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <label class="input input-bordered flex items-center gap-2">
            <MagnifyingGlassIcon class="text-base-content/45 h-4 w-4 shrink-0" />
            <input
              v-model.trim="ruleSetSearch"
              class="grow"
              type="text"
              placeholder="搜索规则集名称、路径或格式"
            />
          </label>
          <select
            v-model="ruleSetSourceFilter"
            class="select select-bordered w-full"
          >
            <option value="all">全部来源</option>
            <option value="built-in">内置规则集</option>
            <option value="custom">自定义规则集</option>
          </select>
          <button
            class="btn btn-primary"
            type="button"
            :disabled="ruleSetLoading"
            @click="searchRuleSets"
          >
            <MagnifyingGlassIcon class="h-4 w-4" />
            筛选
          </button>
        </div>

        <div class="text-base-content/60 text-sm">
          当前显示 {{ availableRuleSets.length }} 个规则集，可多选
          <span v-if="ruleSetLoading">，正在加载</span>
        </div>

        <div
          class="border-base-300/60 max-h-[380px] space-y-2 overflow-y-auto rounded-2xl border p-2"
        >
          <label
            v-for="item in availableRuleSets"
            :key="item.value"
            class="border-base-300/50 bg-base-200/25 flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2"
          >
            <input
              v-model="draftSelectedRuleSetNames"
              class="checkbox checkbox-sm mt-0.5"
              type="checkbox"
              :value="item.value"
            />
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm font-medium">{{ item.label }}</div>
              <div class="text-base-content/55 mt-1 truncate text-xs">
                {{ item.value }}
              </div>
              <div class="text-base-content/55 mt-1 text-xs">
                {{ item.description }}
              </div>
            </div>
            <span
              class="badge badge-sm shrink-0"
              :class="item.source === 'built-in' ? 'badge-primary badge-outline' : 'badge-ghost'"
            >
              {{ item.source === 'built-in' ? '内置' : '自定义' }}
            </span>
          </label>

          <div
            v-if="availableRuleSets.length === 0"
            class="text-base-content/55 py-8 text-center text-sm"
          >
            没有匹配的规则集
          </div>
        </div>

        <div class="border-base-300/60 rounded-2xl border p-3">
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-medium">已选规则集</div>
            <button
              class="btn btn-ghost btn-xs"
              type="button"
              :disabled="draftSelectedRuleSetNames.length === 0"
              @click="draftSelectedRuleSetNames = []"
            >
              清空
            </button>
          </div>
          <div
            v-if="draftSelectedRuleSetOptions.length > 0"
            class="mt-3 flex flex-wrap gap-2"
          >
            <span
              v-for="item in draftSelectedRuleSetOptions"
              :key="item.value"
              class="badge badge-outline max-w-full gap-1 py-3"
            >
              <span class="truncate">{{ item.label }}</span>
              <button
                class="btn btn-ghost btn-circle btn-xs"
                type="button"
                @click="removeDraftRuleSet(item.value)"
              >
                <XMarkIcon class="h-3 w-3" />
              </button>
            </span>
          </div>
          <div
            v-else
            class="text-base-content/55 mt-3 text-sm"
          >
            从上方列表选择一个或多个规则集。
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <button
            class="btn btn-sm"
            type="button"
            @click="ruleSetDialogOpen = false"
          >
            取消
          </button>
          <button
            class="btn btn-primary btn-sm"
            type="button"
            :disabled="draftSelectedRuleSetNames.length === 0"
            @click="confirmRuleSetSelection"
          >
            使用选中规则集
          </button>
        </div>
      </div>
    </DialogWrapper>

    <DialogWrapper
      v-model="outboundDialogOpen"
      title="选择出站标签"
      box-class="max-w-2xl"
      @enter="confirmOutboundTarget"
    >
      <div class="space-y-4">
        <input
          v-model.trim="resourceSearch"
          class="input input-bordered w-full"
          type="text"
          placeholder="搜索节点或分组"
        />

        <div class="text-base-content/60 text-sm">
          可选 {{ filteredResources.length }} 个资源，只能选择一个出站标签
        </div>

        <div
          class="border-base-300/60 max-h-[420px] space-y-2 overflow-y-auto rounded-2xl border p-2"
        >
          <label
            v-for="resource in filteredResources"
            :key="getResourceKey(resource)"
            class="border-base-300/50 bg-base-200/25 flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2"
          >
            <input
              v-model="selectedResourceKey"
              class="radio radio-sm"
              type="radio"
              name="rule-card-outbound-target"
              :value="getResourceKey(resource)"
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
            @click="outboundDialogOpen = false"
          >
            取消
          </button>
          <button
            class="btn btn-primary btn-sm"
            type="button"
            :disabled="!selectedResourceKey"
            @click="confirmOutboundTarget"
          >
            确认
          </button>
        </div>
      </div>
    </DialogWrapper>
  </section>
</template>

<script setup lang="ts">
import DialogWrapper from '@/components/common/DialogWrapper.vue'
import type { RoutingItemReference } from '@/components/routing/RoutingRuleGroupBucket.vue'
import type { FastProxyNormalizedRule } from '@/types/fastproxy'
import {
  Bars3Icon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { computed, ref } from 'vue'

export type RoutingRuleLeaf = {
  condition: string
  id: string
  target: string
  value: string | string[]
}

export type RoutingRuleDraft = Pick<RoutingRuleLeaf, 'condition' | 'target' | 'value'>

export type RoutingRuleCardResource = {
  enabled: boolean
  id: string
  name: string
  outboundTarget: RoutingRuleTargetReference | null
  rules: RoutingRuleLeaf[]
  sourceRule?: FastProxyNormalizedRule
  sourceSignature?: string
}

export type RoutingRuleTargetReference = {
  id: string
  name: string
  type: RoutingItemReference['type']
}

export type RuleSetOption = {
  value: string
  label: string
  description: string
  source: 'built-in' | 'custom'
}

const props = defineProps<{
  availableResources: RoutingItemReference[]
  availableRuleSets: RuleSetOption[]
  card: RoutingRuleCardResource
  collapsedIds: string[]
  ruleSetLoading?: boolean
}>()

const emit = defineEmits<{
  'add-rule': [cardId: string, rule: RoutingRuleDraft]
  'delete-card': [cardId: string]
  'edit-card': [cardId: string]
  'remove-rule': [cardId: string, ruleId: string]
  'search-rule-sets': [options: { query: string; source: 'all' | RuleSetOption['source'] }]
  'toggle-card': [cardId: string]
  'update-enabled': [cardId: string, enabled: boolean]
  'update-outbound-target': [cardId: string, target: RoutingItemReference]
}>()

const isCollapsed = computed(() => props.collapsedIds.includes(props.card.id))
const addRuleDialogOpen = ref(false)
const outboundDialogOpen = ref(false)
const ruleSetDialogOpen = ref(false)
const outboundDialogContext = ref<'card' | 'draft'>('card')
const newRuleField = ref('domain_suffix')
const newRuleValueMode = ref<'string' | 'array'>('string')
const newRuleValue = ref('')
const newRuleValuesText = ref('')
const selectedRuleSetNames = ref<string[]>([])
const draftSelectedRuleSetNames = ref<string[]>([])
const draftOutboundTarget = ref<RoutingRuleTargetReference | null>(null)
const resourceSearch = ref('')
const ruleSetSearch = ref('')
const ruleSetSourceFilter = ref<'all' | RuleSetOption['source']>('built-in')
const selectedResourceKey = ref('')

const routeRuleOptions = [
  { value: 'domain', label: 'domain', placeholder: '例如：example.com' },
  { value: 'domain_suffix', label: 'domain_suffix', placeholder: '例如：netflix.com' },
  { value: 'domain_keyword', label: 'domain_keyword', placeholder: '例如：youtube' },
  { value: 'domain_regex', label: 'domain_regex', placeholder: '例如：^stun\\..+' },
  { value: 'geosite', label: 'geosite', placeholder: '例如：geolocation-!cn' },
  { value: 'geoip', label: 'geoip', placeholder: '例如：cn' },
  { value: 'ip_cidr', label: 'ip_cidr', placeholder: '例如：1.1.1.1/32' },
  { value: 'rule_set', label: 'rule_set', placeholder: '选择原生规则集名称' },
  { value: 'process_name', label: 'process_name', placeholder: '例如：Safari' },
  { value: 'package_name', label: 'package_name', placeholder: '例如：com.example.app' },
  { value: 'port', label: 'port', placeholder: '例如：443' },
] as const

const cardTitle = computed(() => props.card.outboundTarget?.name ?? '未选择出站')
const draftOutboundLabel = computed(() => draftOutboundTarget.value?.name ?? '选择出站标签')
const selectedRuleOption = computed(() => {
  return routeRuleOptions.find((option) => option.value === newRuleField.value)
})
const isRuleSetField = computed(() => normalizeRuleKey(newRuleField.value) === 'rule_set')
const canConfirmAddRule = computed(() => {
  return Boolean(draftOutboundTarget.value?.name && buildRuleValue().length > 0)
})
const arrayValuePlaceholder = computed(() => {
  const sample = selectedRuleOption.value?.placeholder ?? 'value-1'

  return `${sample}\nvalue-2\nvalue-3`
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
const availableRuleSets = computed(() => props.availableRuleSets)
const ruleSetLookup = computed(() => {
  return new Map(availableRuleSets.value.map((item) => [item.value, item]))
})
const selectedRuleSetOptions = computed(() => {
  return selectedRuleSetNames.value.map(ruleSetOptionFromValue)
})
const draftSelectedRuleSetOptions = computed(() => {
  return draftSelectedRuleSetNames.value.map(ruleSetOptionFromValue)
})
const selectedRuleSetSummary = computed(() => {
  if (selectedRuleSetNames.value.length === 0) return '选择内置规则集'
  if (selectedRuleSetNames.value.length === 1)
    return selectedRuleSetOptions.value[0]?.label || '1 个规则集'
  return `已选择 ${selectedRuleSetNames.value.length} 个规则集`
})

const formatRuleSummary = (rule: RoutingRuleLeaf) => {
  const ruleKey = normalizeRuleKey(rule.condition)

  return JSON.stringify({
    [ruleKey]: rule.value,
    outbound: rule.target,
  })
}

const generatedRuleJson = computed(() => {
  const ruleValue = materializeRuleValue()

  return JSON.stringify(
    {
      [normalizeRuleKey(newRuleField.value)]: ruleValue,
      outbound: draftOutboundTarget.value?.name ?? '',
    },
    null,
    2,
  )
})

const getResourceKey = (resource: RoutingItemReference) => `${resource.type}:${resource.id}`
const normalizeRuleKey = (value: string) => value.toLowerCase().replaceAll('-', '_')
const ruleSetOptionFromValue = (value: string): RuleSetOption => {
  return (
    ruleSetLookup.value.get(value) || {
      value,
      label: value,
      description: '已选规则集',
      source: 'custom',
    }
  )
}

const resetAddRuleDialog = () => {
  newRuleField.value = 'domain_suffix'
  newRuleValueMode.value = 'string'
  newRuleValue.value = ''
  newRuleValuesText.value = ''
  selectedRuleSetNames.value = []
  draftSelectedRuleSetNames.value = []
  draftOutboundTarget.value = props.card.outboundTarget
}

const openAddRuleDialog = () => {
  resetAddRuleDialog()
  addRuleDialogOpen.value = true
}

const confirmAddRule = () => {
  if (!draftOutboundTarget.value?.name) return

  const value = materializeRuleValue()
  if (!value || (Array.isArray(value) && value.length === 0)) return

  emit('add-rule', props.card.id, {
    condition: normalizeRuleKey(newRuleField.value),
    target: draftOutboundTarget.value.name,
    value,
  })
  addRuleDialogOpen.value = false
  resetAddRuleDialog()
}

const openOutboundDialog = () => {
  outboundDialogContext.value = 'card'
  resourceSearch.value = ''
  selectedResourceKey.value = props.card.outboundTarget
    ? `${props.card.outboundTarget.type}:${props.card.outboundTarget.id}`
    : ''
  outboundDialogOpen.value = true
}

const openDraftOutboundDialog = () => {
  outboundDialogContext.value = 'draft'
  resourceSearch.value = ''
  selectedResourceKey.value = draftOutboundTarget.value
    ? `${draftOutboundTarget.value.type}:${draftOutboundTarget.value.id}`
    : ''
  outboundDialogOpen.value = true
}

const openRuleSetDialog = () => {
  ruleSetSearch.value = ''
  ruleSetSourceFilter.value = 'built-in'
  draftSelectedRuleSetNames.value = [...selectedRuleSetNames.value]
  searchRuleSets()
  ruleSetDialogOpen.value = true
}

const searchRuleSets = () => {
  emit('search-rule-sets', {
    query: ruleSetSearch.value.trim(),
    source: ruleSetSourceFilter.value,
  })
}

const confirmRuleSetSelection = () => {
  selectedRuleSetNames.value = [...draftSelectedRuleSetNames.value]
  ruleSetDialogOpen.value = false
}

const removeSelectedRuleSet = (value: string) => {
  selectedRuleSetNames.value = selectedRuleSetNames.value.filter((item) => item !== value)
}

const removeDraftRuleSet = (value: string) => {
  draftSelectedRuleSetNames.value = draftSelectedRuleSetNames.value.filter((item) => item !== value)
}

const confirmOutboundTarget = () => {
  const selectedResource = props.availableResources.find((resource) => {
    return getResourceKey(resource) === selectedResourceKey.value
  })
  if (!selectedResource) return

  if (outboundDialogContext.value === 'draft') {
    draftOutboundTarget.value = {
      id: selectedResource.id,
      name: selectedResource.name,
      type: selectedResource.type,
    }
  } else {
    emit('update-outbound-target', props.card.id, selectedResource)
  }
  outboundDialogOpen.value = false
}

function buildRuleValue() {
  if (isRuleSetField.value) {
    return draftSelectedRuleSetNames.value
  }
  return newRuleValueMode.value === 'array'
    ? newRuleValuesText.value
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)
    : newRuleValue.value.trim()
}

function materializeRuleValue() {
  const value = buildRuleValue()
  return Array.isArray(value) ? value : value.trim()
}
</script>
