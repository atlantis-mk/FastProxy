import {
  activateProfileAPI,
  createProfileAPI,
  fetchCoreInventoryAPI,
  fetchFastProxyBootstrapAPI,
  fetchRepositoryBootstrapAPI,
  fetchRuntimeStatusAPI,
  runRuntimeLifecycleAPI,
  selectRuntimeCoreAPI,
  updateProfileAPI,
} from '@/api/fastproxy'
import type {
  FastProxyBootstrapPayload,
  FastProxyCoreId,
  FastProxyCoreInventoryItem,
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
export const fastProxyActiveProfile = computed(() => {
  const repository = fastProxyRepository.value
  if (!repository?.state.activeProfileId) {
    return null
  }
  return (
    repository.profiles.find((profile) => profile.id === repository.state.activeProfileId) || null
  )
})
export const fastProxySelectedCore = computed(
  () =>
    fastProxyActiveProfile.value?.selectedCore ||
    fastProxyRuntimeStatus.value?.selectedCore ||
    fastProxyRuntimeStatus.value?.core ||
    'mihomo',
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
    const activeProfile = await ensureFastProxyActiveProfile()
    const linkedResourceIds = inferLinkedRoutingResources(ruleSetId)
    const { data } = await updateProfileAPI(activeProfile.id, {
      ...activeProfile,
      ruleSetIds: ruleSetId ? [ruleSetId] : [],
      nodeSetIds: mergeIds(activeProfile.nodeSetIds, linkedResourceIds.nodeSetIds),
      groupSetIds: linkedResourceIds.groupSetIds,
    })
    if (fastProxyRepository.value) {
      fastProxyRepository.value = {
        ...fastProxyRepository.value,
        profiles: fastProxyRepository.value.profiles.map((profile) =>
          profile.id === data.id ? data : profile,
        ),
      }
    }
    return data
  } finally {
    fastProxyRuntimeBusy.value = false
  }
}

const inferLinkedRoutingResources = (ruleSetId: string) => {
  if (!ruleSetId || !fastProxyRepository.value) {
    return { nodeSetIds: [], groupSetIds: [] }
  }

  const selectedRuleSet = fastProxyRepository.value.routingRuleSets.find(
    (ruleSet) => ruleSet.id === ruleSetId,
  )
  const relatedNames = new Set([ruleSetId, selectedRuleSet?.name].filter(Boolean))
  return {
    nodeSetIds: fastProxyRepository.value.nodeSets.map((nodeSet) => nodeSet.id),
    groupSetIds: fastProxyRepository.value.groupSets
      .filter((groupSet) => relatedNames.has(groupSet.id) || relatedNames.has(groupSet.name))
      .map((groupSet) => groupSet.id),
  }
}

const mergeIds = (current: string[] = [], next: string[]) => {
  return Array.from(new Set([...current, ...next]))
}

const ensureFastProxyActiveProfile = async () => {
  const activeProfile = fastProxyActiveProfile.value
  if (activeProfile) {
    return activeProfile
  }

  const selectedCore = fastProxyRuntimeStatus.value?.selectedCore || fastProxyRuntimeStatus.value?.core || 'mihomo'
  const { data } = await createProfileAPI({
    name: 'Default profile',
    selectedCore,
  })
  if (fastProxyRepository.value) {
    fastProxyRepository.value = {
      ...fastProxyRepository.value,
      state: {
        ...fastProxyRepository.value.state,
        activeProfileId: data.id,
      },
      profiles: [...fastProxyRepository.value.profiles, data],
    }
  }
  return data
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
        profiles: fastProxyRepository.value.profiles.map((profile) =>
          profile.id === data.id ? data : profile,
        ),
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

export const activateFastProxyProfile = async (profileId: string) => {
  fastProxyBusy.value = true
  try {
    const { data } = await activateProfileAPI(profileId)
    if (fastProxyRepository.value) {
      fastProxyRepository.value = {
        ...fastProxyRepository.value,
        state: data,
      }
    }
    return data
  } finally {
    fastProxyBusy.value = false
  }
}
