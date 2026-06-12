<template>
  <div class="bg-base-200/40 min-h-full px-3 pt-4 pb-24 sm:px-5 md:pb-6 lg:px-6">
    <main class="mx-auto flex w-full flex-col gap-5">
      <section class="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <div class="border-base-300 bg-base-100 rounded-xl border p-4 shadow-sm sm:p-5">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 class="text-xl font-semibold">运行控制</h2>
              <div class="text-base-content/55 mt-1 text-xs">
                所选内核版本：{{ selectedCoreVersionText }}
              </div>
            </div>

            <div
              class="border-base-300 divide-base-300 bg-base-200/40 grid grid-cols-2 overflow-hidden rounded-lg border lg:min-w-80"
            >
              <div class="p-3">
                <div class="text-base-content/50 text-xs">{{ $t('homeSelectedCore') }}</div>
                <div class="mt-1 text-sm font-semibold">{{ selectedCore }}</div>
              </div>
              <div class="border-base-300 border-l p-3">
                <div class="text-base-content/50 text-xs">运行内核</div>
                <div class="mt-1 text-sm font-semibold">{{ runningCore || '未运行' }}</div>
              </div>
            </div>
          </div>

          <div class="mt-5 grid gap-3 md:grid-cols-2">
            <label class="form-control">
              <span class="label pb-1">
                <span class="label-text text-sm font-medium">{{ $t('homeSelectedCore') }}</span>
              </span>
              <select
                class="select select-bordered w-full"
                :value="selectedCore"
                :disabled="!isFastProxy || runtimeAction !== null"
                aria-label="选择内核"
                @change="handleCoreChange"
              >
                <option value="mihomo">mihomo</option>
                <option value="sing-box">sing-box</option>
              </select>
              <span class="text-base-content/55 mt-2 text-xs">
                {{ pendingCoreSwitch ? `运行中仍是 ${runningCore}` : '配置目标核心' }}
              </span>
            </label>

            <label class="form-control">
              <span class="label pb-1">
                <span class="label-text text-sm font-medium">路由规则</span>
              </span>
              <select
                class="select select-bordered w-full"
                :value="selectedRoutingRuleSetId"
                :disabled="!isFastProxy || runtimeAction !== null || routingRuleSets.length === 0"
                aria-label="选择路由规则"
                @change="handleRoutingRuleSetChange"
              >
                <option
                  v-for="ruleSet in routingRuleSets"
                  :key="ruleSet.id"
                  :value="ruleSet.id"
                >
                  {{ ruleSet.name }}
                </option>
              </select>
              <span class="text-base-content/55 mt-2 line-clamp-1 text-xs">
                {{ selectedRoutingRuleSetName }}
              </span>
            </label>
          </div>

          <div
            v-if="isFastProxy"
            class="border-base-300 bg-base-200/35 mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
          >
            <label class="flex min-h-9 items-center gap-3">
              <input
                class="toggle toggle-primary"
                type="checkbox"
                :checked="runtimeSwitchChecked"
                :disabled="runtimeAction !== null"
                aria-label="启动或停止运行时"
                @change="handleRuntimeToggle"
              />
              <span class="text-sm font-medium">
                {{ runtimeSwitchChecked ? '运行中' : '已停止' }}
              </span>
            </label>

            <div class="flex items-center gap-2">
              <button
                v-if="runtimeSwitchChecked"
                class="btn btn-square btn-outline btn-sm"
                :disabled="runtimeAction !== null"
                title="重启"
                aria-label="重启运行时"
                @click="runRuntimeAction('restart')"
              >
                <ArrowPathIcon
                  class="h-4 w-4"
                  :class="runtimeAction === 'restart' && 'animate-spin'"
                />
              </button>
              <button
                v-if="runtimeSwitchChecked && pendingRestart"
                class="btn btn-square btn-primary btn-sm"
                :disabled="runtimeAction !== null"
                title="应用并重启"
                aria-label="应用配置并重启运行时"
                @click="runRuntimeAction('restart-and-apply')"
              >
                <CheckCircleIcon
                  v-if="runtimeAction !== 'restart-and-apply'"
                  class="h-4 w-4"
                />
                <ArrowPathIcon
                  v-else
                  class="h-4 w-4 animate-spin"
                />
              </button>
            </div>
          </div>

          <div
            v-else
            class="border-base-300 bg-base-200/45 mt-5 rounded-lg border p-4"
          >
            <div class="text-sm font-medium">当前后端仍使用控制器模式。</div>
            <div class="text-base-content/60 mt-1 text-sm">
              首页会保留旧的代理与监控入口，不显示 FastProxy 仓库操作。
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <button
                class="btn btn-primary btn-sm"
                @click="router.push({ name: ROUTE_NAME.proxies })"
              >
                {{ $t('proxies') }}
              </button>
              <button
                class="btn btn-outline btn-sm"
                @click="router.push({ name: ROUTE_NAME.setup })"
              >
                {{ $t('setup') }}
              </button>
            </div>
          </div>

          <p
            v-if="runtimeError"
            class="text-error mt-4 text-sm"
          >
            {{ runtimeError }}
          </p>
        </div>

        <aside class="border-base-300 bg-base-100 rounded-xl border p-4 shadow-sm sm:p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold">{{ statusTitle }}</h2>
            </div>
          </div>

          <template v-if="isFastProxy">
            <dl class="divide-base-300 mt-5 divide-y">
              <div
                v-for="item in repositorySummary"
                :key="item.label"
                class="grid gap-1 py-3 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4"
              >
                <dt class="text-base-content/50 text-xs font-medium tracking-wide uppercase">
                  {{ item.label }}
                </dt>
                <dd class="min-w-0 text-sm">
                  <div class="truncate font-medium">{{ item.value }}</div>
                  <div
                    v-if="item.description"
                    class="text-base-content/55 mt-1 truncate text-xs"
                  >
                    {{ item.description }}
                  </div>
                </dd>
              </div>
            </dl>

            <div class="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2">
              <div
                v-for="stat in repositoryStats"
                :key="stat.label"
                class="border-base-300 rounded-lg border p-3"
              >
                <div class="text-base-content/50 text-xs">{{ stat.label }}</div>
                <div class="mt-1 text-lg font-semibold">{{ stat.value }}</div>
              </div>
            </div>

            <div class="mt-5 flex flex-wrap gap-2">
              <button
                class="btn btn-primary btn-sm"
                @click="router.push({ name: ROUTE_NAME.configManagement })"
              >
                {{ $t('configManagement') }}
              </button>
              <button
                class="btn btn-outline btn-sm"
                @click="router.push({ name: ROUTE_NAME.configSubscriptions })"
              >
                {{ $t('configSubscriptions') }}
              </button>
              <button
                class="btn btn-ghost btn-sm"
                @click="router.push({ name: ROUTE_NAME.kernelManagement })"
              >
                {{ $t('kernelManagement') }}
              </button>
            </div>
          </template>
        </aside>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ROUTE_NAME } from '@/constant'
import {
  fastProxyBootstrap,
  fastProxyRepository,
  fastProxyRoutingRuleSets,
  fastProxyRuntimeStatus,
  fastProxySelectedCore,
  fastProxySelectedCoreVersionText,
  fastProxySelectedRoutingRuleSetIds,
  loadFastProxyCoreInventory,
  loadFastProxyWorkspace,
  runFastProxyRuntimeLifecycle,
  selectFastProxyRoutingRuleSet,
  selectFastProxyRuntimeCore,
} from '@/store/fastproxyRepository'
import { initRuntimePanelData, stopRuntimePanelData } from '@/store/runtimePanel'
import { activeBackendFlavor } from '@/store/setup'
import type { FastProxyCoreId } from '@/types/fastproxy'
import { ArrowPathIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import { showNotification } from '@/helper/notification'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const runtimeAction = ref<'start' | 'stop' | 'restart' | 'restart-and-apply' | null>(null)
const runtimeError = ref('')
const isFastProxy = computed(() => activeBackendFlavor.value === 'fastproxy')
const bootstrap = computed(() => fastProxyBootstrap.value)
const selectedCore = computed(() => fastProxySelectedCore.value)
const selectedCoreVersionText = computed(() => fastProxySelectedCoreVersionText.value)
const runningCore = computed(() => fastProxyRuntimeStatus.value?.core || '')
const runtimeStateLabel = computed(() => fastProxyRuntimeStatus.value?.state || 'stopped')
const runtimeSwitchChecked = computed(() =>
  ['running', 'starting'].includes(runtimeStateLabel.value),
)
const pendingCoreSwitch = computed(() =>
  Boolean(runningCore.value && runningCore.value !== selectedCore.value),
)
const pendingRestart = computed(
  () => Boolean(fastProxyRuntimeStatus.value?.pendingRestart) || pendingCoreSwitch.value,
)
const isRoutingRuleSetSupported = (supportedCores?: FastProxyCoreId[]) => {
  return !supportedCores?.length || supportedCores.includes(selectedCore.value)
}
const routingRuleSets = computed(() =>
  fastProxyRoutingRuleSets.value.filter((ruleSet) =>
    isRoutingRuleSetSupported(ruleSet.supportedCores),
  ),
)
const activeRoutingRuleSetId = computed(() => fastProxySelectedRoutingRuleSetIds.value[0] || '')
const activeRoutingRuleSetSupported = computed(() => {
  if (!activeRoutingRuleSetId.value) return false
  const activeRuleSet = fastProxyRoutingRuleSets.value.find(
    (ruleSet) => ruleSet.id === activeRoutingRuleSetId.value,
  )
  return Boolean(activeRuleSet && isRoutingRuleSetSupported(activeRuleSet.supportedCores))
})
const defaultRoutingRuleSetId = computed(() => routingRuleSets.value[0]?.id || '')
const selectedRoutingRuleSetId = computed(() =>
  activeRoutingRuleSetSupported.value
    ? activeRoutingRuleSetId.value
    : defaultRoutingRuleSetId.value,
)
const selectedRoutingRuleSetName = computed(() => {
  if (!selectedRoutingRuleSetId.value) return '暂无可用路由规则集'
  return (
    routingRuleSets.value.find((ruleSet) => ruleSet.id === selectedRoutingRuleSetId.value)?.name ||
    '已绑定的路由规则集不在当前仓库中'
  )
})
const repositorySummary = computed(() => [
  {
    label: '运行配置',
    value: selectedCore.value,
    description: 'SQLite 全局配置',
  },
  {
    label: '数据目录',
    value: bootstrap.value?.dataDir || '-',
    description: 'FastProxy 本地工作区',
  },
  {
    label: '路由规则',
    value: selectedRoutingRuleSetName.value,
    description: `${routingRuleSets.value.length} 个当前内核可用规则集`,
  },
])
const repositoryStats = computed(() => {
  const repository = fastProxyRepository.value
  return [
    { label: '订阅', value: repository?.subscriptions.length ?? 0 },
    { label: '节点集', value: repository?.nodeSets.length ?? 0 },
    { label: '路由规则', value: repository?.routingRuleSets.length ?? 0 },
    { label: '规则源', value: repository?.ruleSourceRepositories.length ?? 0 },
  ]
})

const statusTitle = computed(() => (isFastProxy.value ? '仓库概览' : '控制器状态'))

const handleCoreChange = async (event: Event) => {
  const core = (event.target as HTMLSelectElement).value as FastProxyCoreId
  runtimeAction.value = 'restart-and-apply'
  runtimeError.value = ''
  try {
    await selectFastProxyRuntimeCore(core)
    await loadFastProxyCoreInventory()
    showNotification({
      content: `已选择 ${core}，应用并重启后生效`,
      type: 'alert-success',
    })
  } catch (error) {
    runtimeError.value = error instanceof Error ? error.message : '切换内核失败'
    showNotification({ content: runtimeError.value, type: 'alert-error' })
  } finally {
    runtimeAction.value = null
  }
}

const handleRoutingRuleSetChange = async (event: Event) => {
  const ruleSetId = (event.target as HTMLSelectElement).value
  if (!ruleSetId) return

  runtimeAction.value = 'restart-and-apply'
  runtimeError.value = ''
  try {
    await selectFastProxyRoutingRuleSet(ruleSetId)
    showNotification({
      content: '路由规则已选择，应用并重启后生效',
      type: 'alert-success',
    })
  } catch (error) {
    runtimeError.value = error instanceof Error ? error.message : '选择路由规则失败'
    showNotification({ content: runtimeError.value, type: 'alert-error' })
  } finally {
    runtimeAction.value = null
  }
}

const handleRuntimeToggle = async (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  await runRuntimeAction(checked ? 'start' : 'stop')
}

const runRuntimeAction = async (action: 'start' | 'stop' | 'restart' | 'restart-and-apply') => {
  runtimeAction.value = action
  runtimeError.value = ''
  try {
    const status = await runFastProxyRuntimeLifecycle(action)
    showNotification({ content: runtimeActionLabel(action) + '已完成', type: 'alert-success' })
    await Promise.all([loadFastProxyWorkspace(), loadFastProxyCoreInventory()])
    if (status.state === 'running') {
      await initRuntimePanelData()
    } else {
      stopRuntimePanelData()
    }
  } catch (error) {
    runtimeError.value =
      error instanceof Error ? error.message : runtimeActionLabel(action) + '失败'
    showNotification({ content: runtimeError.value, type: 'alert-error' })
    await loadFastProxyWorkspace().catch(() => undefined)
  } finally {
    runtimeAction.value = null
  }
}

const runtimeActionLabel = (action: 'start' | 'stop' | 'restart' | 'restart-and-apply') => {
  if (action === 'start') return '启动'
  if (action === 'stop') return '停止'
  if (action === 'restart') return '重启'
  return '应用并重启'
}

const defaultRoutingRuleSetSyncing = ref(false)

const ensureDefaultRoutingRuleSet = async () => {
  if (
    !isFastProxy.value ||
    defaultRoutingRuleSetSyncing.value ||
    activeRoutingRuleSetSupported.value ||
    !defaultRoutingRuleSetId.value
  ) {
    return
  }

  defaultRoutingRuleSetSyncing.value = true
  try {
    await selectFastProxyRoutingRuleSet(defaultRoutingRuleSetId.value)
  } catch (error) {
    runtimeError.value = error instanceof Error ? error.message : '选择默认路由规则失败'
  } finally {
    defaultRoutingRuleSetSyncing.value = false
  }
}

watch(
  [isFastProxy, activeRoutingRuleSetId, activeRoutingRuleSetSupported, defaultRoutingRuleSetId],
  () => {
    ensureDefaultRoutingRuleSet()
  },
  { immediate: true },
)

onMounted(async () => {
  if (isFastProxy.value) {
    await Promise.all([loadFastProxyWorkspace(), loadFastProxyCoreInventory()])
    await ensureDefaultRoutingRuleSet()
  }
})
</script>
