import {
  fetchCoreInventoryAPI,
  fetchFastProxyBootstrapAPI,
  fetchRepositoryBootstrapAPI,
  fetchRuntimeStatusAPI,
  runRuntimeLifecycleAPI,
  selectRuntimeCoreAPI,
  updateGlobalConfigAPI,
} from '@/api/fastproxy'
import type {
  FastProxyBootstrapPayload,
  FastProxyCoreId,
  FastProxyCoreInventoryItem,
  FastProxyGlobalConfig,
  FastProxyGlobalConfigFieldValue,
  FastProxyRepositoryBootstrap,
  FastProxyRuntimeStatus,
} from '@/types/fastproxy'
import { computed, ref } from 'vue'

export const fastProxyBootstrap = ref<FastProxyBootstrapPayload | null>(null)
export const fastProxyCoreInventory = ref<FastProxyCoreInventoryItem[]>([])
export const fastProxyRepository = ref<FastProxyRepositoryBootstrap | null>(null)
export const fastProxyRuntimeStatus = ref<FastProxyRuntimeStatus | null>(null)
export const fastProxyBusy = ref(false)
export const fastProxyRuntimeBusy = ref(false)

export const fastProxyProfiles = computed(() => fastProxyRepository.value?.profiles || [])
export const fastProxyRoutingRuleSets = computed(
  () => fastProxyRepository.value?.routingRuleSets || [],
)
export const fastProxyGlobalConfig = computed(() => fastProxyRepository.value?.config || null)
export const fastProxyGlobalConfigFields = computed(() => fastProxyGlobalConfig.value?.fields || {})
export const fastProxySelectedCore = computed(
  () =>
    (fastProxyGlobalConfigFields.value.selectedCore as FastProxyCoreId | undefined) ||
    fastProxyRuntimeStatus.value?.selectedCore ||
    fastProxyRuntimeStatus.value?.core ||
    'mihomo',
)
export const fastProxySelectedRoutingRuleSetIds = computed(() =>
  stringValues(fastProxyGlobalConfigFields.value.routingRuleSetIds),
)
export const fastProxySelectedCoreInventory = computed(
  () =>
    fastProxyCoreInventory.value.find((item) => item.core === fastProxySelectedCore.value) || null,
)
export const fastProxySelectedCoreVersionText = computed(() => {
  const inventory = fastProxySelectedCoreInventory.value
  if (!inventory) return '未加载'
  if (inventory.cachedVersion) return inventory.cachedVersion
  if (inventory.configured) return '本地配置路径'
  return '未安装'
})

export const loadFastProxyWorkspace = async () => {
  fastProxyBusy.value = true
  try {
    const [bootstrapResponse, repositoryResponse, runtimeResponse] = await Promise.all([
      fetchFastProxyBootstrapAPI(),
      fetchRepositoryBootstrapAPI(),
      fetchRuntimeStatusAPI(),
    ])

    fastProxyBootstrap.value = bootstrapResponse.data
    fastProxyRepository.value = repositoryResponse.data
    fastProxyRuntimeStatus.value = runtimeResponse.data
    return repositoryResponse.data
  } finally {
    fastProxyBusy.value = false
  }
}

export const loadFastProxyCoreInventory = async () => {
  const { data } = await fetchCoreInventoryAPI()
  fastProxyCoreInventory.value = data.cores
  return data.cores
}

export const selectFastProxyRoutingRuleSet = async (ruleSetId: string) => {
  fastProxyRuntimeBusy.value = true
  try {
    const data = await updateFastProxyGlobalConfigFields({
      routingRuleSetIds: ruleSetId ? [ruleSetId] : [],
    })
    return data
  } finally {
    fastProxyRuntimeBusy.value = false
  }
}

export const updateFastProxyGlobalConfigFields = async (
  fields: Record<string, FastProxyGlobalConfigFieldValue>,
) => {
  const currentConfig =
    fastProxyRepository.value?.config || ({ fields: {} } as FastProxyGlobalConfig)
  const { data } = await updateGlobalConfigAPI({
    ...currentConfig,
    fields: {
      ...(currentConfig.fields || {}),
      ...fields,
    },
  })
  if (fastProxyRepository.value) {
    fastProxyRepository.value = {
      ...fastProxyRepository.value,
      config: data,
    }
  }
  return data
}

const stringValues = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string')
  }
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()]
  }
  return []
}

export const refreshFastProxyRuntimeStatus = async () => {
  const { data } = await fetchRuntimeStatusAPI()
  fastProxyRuntimeStatus.value = data
  return data
}

export const selectFastProxyRuntimeCore = async (core: FastProxyCoreId) => {
  fastProxyRuntimeBusy.value = true
  try {
    const { data } = await selectRuntimeCoreAPI(core)
    if (fastProxyRepository.value) {
      fastProxyRepository.value = {
        ...fastProxyRepository.value,
        config: data,
      }
    }
    await refreshFastProxyRuntimeStatus()
    return data
  } finally {
    fastProxyRuntimeBusy.value = false
  }
}

export const runFastProxyRuntimeLifecycle = async (
  action: 'start' | 'stop' | 'restart' | 'restart-and-apply',
) => {
  fastProxyRuntimeBusy.value = true
  try {
    const { data } = await runRuntimeLifecycleAPI(action)
    fastProxyRuntimeStatus.value = data
    return data
  } finally {
    fastProxyRuntimeBusy.value = false
  }
}
