<template>
  <div
    class="relative flex size-full flex-col overflow-hidden"
    :style="padding"
  >
    <CtrlsBar>
      <div class="flex flex-wrap items-center gap-3 p-2 md:flex-nowrap">
        <div
          class="text-base-content/65 flex min-w-0 flex-1 flex-wrap items-center gap-2 px-2 text-sm"
        >
          <span class="badge badge-ghost">订阅 {{ subscriptions.length }}</span>
          <span class="badge badge-ghost">配置 {{ profiles.length }}</span>
          <span class="badge badge-ghost">最近更新 {{ lastUpdated }}</span>
          <span class="hidden truncate md:inline">删除订阅会自动解绑已关联配置。</span>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            class="btn btn-sm"
            :disabled="busy || actionLoading"
            @click="refreshWorkspace"
          >
            {{ $t('refresh') }}
          </button>
        </div>
      </div>
    </CtrlsBar>

    <div class="base-container m-3 flex-1 overflow-hidden backdrop-blur-none!">
      <div class="relative h-full overflow-hidden">
        <button
          class="btn btn-primary btn-sm absolute right-4 bottom-4 z-20 rounded-full px-5 shadow-lg"
          :disabled="busy || actionLoading"
          @click="openCreateDialog"
        >
          添加
        </button>

        <div class="h-full overflow-auto pb-20">
          <table class="table-pin-rows table-zebra table min-w-[1200px]">
            <thead>
              <tr class="bg-base-100/95">
                <th>订阅名称</th>
                <th>订阅地址</th>
                <th>拉取设置</th>
                <th>自动更新</th>
                <th>同步状态</th>
                <th>快照</th>
                <th>关联配置</th>
                <th class="text-right">操作</th>
              </tr>
            </thead>
            <tbody v-if="subscriptions.length">
              <tr
                v-for="subscription in subscriptions"
                :key="subscription.id"
                class="hover:bg-primary! hover:text-primary-content!"
              >
                <td class="align-top">
                  <div class="max-w-[220px]">
                    <div class="truncate text-sm font-semibold">{{ subscription.name }}</div>
                    <div class="text-base-content/55 mt-1 text-xs">
                      {{ subscription.originType }}
                    </div>
                    <div class="text-base-content/55 mt-2 text-xs">
                      更新于 {{ formatTime(subscription.updatedAt) }}
                    </div>
                  </div>
                </td>
                <td class="align-top">
                  <div class="max-w-[360px] space-y-1 text-xs leading-5 break-all">
                    <div
                      v-for="line in getSourceLines(subscription)"
                      :key="line"
                      class="border-base-300/50 bg-base-200/45 rounded-xl border px-3 py-2"
                    >
                      {{ line }}
                    </div>
                    <div
                      v-if="!getSourceLines(subscription).length"
                      class="text-base-content/40"
                    >
                      暂无订阅地址
                    </div>
                  </div>
                </td>
                <td class="align-top">
                  <div class="max-w-[240px] space-y-2 text-xs">
                    <div class="flex flex-wrap gap-2">
                      <span class="badge badge-outline badge-sm">
                        UA: {{ subscription.fetch?.userAgent || 'Clash' }}
                      </span>
                      <span class="badge badge-ghost badge-sm">
                        源 {{ getSourceLines(subscription).length }}
                      </span>
                    </div>
                    <div class="text-base-content/55 leading-5">
                      直接拉取订阅地址并解析节点、规则和分组。
                    </div>
                  </div>
                </td>
                <td class="align-top">
                  <div class="space-y-2 text-xs">
                    <div
                      class="badge badge-sm"
                      :class="
                        subscription.autoUpdate?.enabled
                          ? 'badge-success badge-outline'
                          : 'badge-ghost'
                      "
                    >
                      {{ subscription.autoUpdate?.enabled ? '已开启' : '已关闭' }}
                    </div>
                    <div class="text-base-content/60">
                      {{ getAutoUpdateText(subscription) }}
                    </div>
                  </div>
                </td>
                <td class="align-top">
                  <div class="max-w-[220px] space-y-2 text-xs">
                    <div
                      class="badge badge-sm"
                      :class="
                        subscription.sync?.lastSyncError
                          ? 'badge-error badge-outline'
                          : 'badge-success badge-outline'
                      "
                    >
                      {{
                        subscription.sync?.lastSyncError
                          ? '同步失败'
                          : subscription.sync?.lastSyncedAt
                            ? '同步正常'
                            : '等待首次同步'
                      }}
                    </div>
                    <div class="text-base-content/60">
                      最近同步:
                      {{
                        subscription.sync?.lastSyncedAt
                          ? formatTime(subscription.sync.lastSyncedAt)
                          : '-'
                      }}
                    </div>
                    <div
                      v-if="subscription.sync?.lastSyncError"
                      class="text-error text-xs leading-5 break-all"
                    >
                      {{ subscription.sync.lastSyncError }}
                    </div>
                  </div>
                </td>
                <td class="align-top">
                  <div class="text-base-content/65 space-y-2 text-xs">
                    <div>
                      节点:
                      {{ getSetName('node', subscription) }}
                      <span class="text-base-content/45">({{ getNodeCount(subscription) }})</span>
                    </div>
                    <div>
                      分组:
                      {{ getSetName('group', subscription) }}
                      <span class="text-base-content/45">({{ getGroupCount(subscription) }})</span>
                    </div>
                    <div>
                      规则:
                      {{ getSetName('rule', subscription) }}
                      <span class="text-base-content/45">({{ getRuleCount(subscription) }})</span>
                    </div>
                    <div v-if="subscription.revision">版本: {{ subscription.revision }}</div>
                  </div>
                </td>
                <td class="align-top">
                  <span class="badge badge-ghost badge-sm">
                    {{ getAttachedProfilesCount(subscription.id) }} 个配置
                  </span>
                </td>
                <td class="align-top">
                  <div class="flex justify-end gap-2">
                    <button
                      class="btn btn-xs btn-outline"
                      :disabled="busy || actionLoading"
                      @click="refreshSubscription(subscription.id)"
                    >
                      立即更新
                    </button>
                    <button
                      class="btn btn-xs"
                      :disabled="busy || actionLoading"
                      @click="openEditDialog(subscription)"
                    >
                      修改
                    </button>
                    <button
                      class="btn btn-xs btn-error btn-outline"
                      :disabled="busy || actionLoading"
                      @click="removeSubscription(subscription)"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="!subscriptions.length"
          class="text-base-content/55 flex h-full min-h-[360px] flex-col items-center justify-center gap-4 px-6 text-center"
        >
          <div class="text-2xl font-semibold">还没有任何配置订阅</div>
          <p class="max-w-xl text-sm leading-6">
            先添加一个订阅源，保存后会自动拉取并解析订阅内容，之后就可以在这里继续修改、删除和配置自动更新。
          </p>
          <button
            class="btn btn-primary"
            :disabled="busy || actionLoading"
            @click="openCreateDialog"
          >
            添加第一个订阅
          </button>
        </div>
      </div>
    </div>

    <DialogWrapper
      v-model="dialogOpen"
      :title="editingId ? '修改配置订阅' : '添加配置订阅'"
      box-class="max-w-5xl"
    >
      <div class="grid gap-5 p-1 lg:grid-cols-[1.05fr_0.95fr]">
        <section class="space-y-4">
          <div class="grid gap-4 md:grid-cols-2">
            <label class="form-control gap-2">
              <span class="label-text text-sm font-medium">配置文件名</span>
              <input
                v-model="form.name"
                class="input input-bordered w-full"
                type="text"
                placeholder="例如：机场 A 主订阅"
              />
              <span class="text-base-content/55 text-xs">用于区分订阅，请尽量不要重名。</span>
            </label>

            <label class="form-control gap-2">
              <span class="label-text text-sm font-medium">User-Agent</span>
              <input
                v-model="form.userAgent"
                class="input input-bordered w-full"
                type="text"
                list="subscription-ua-list"
                placeholder="Clash"
              />
              <datalist id="subscription-ua-list">
                <option value="clash-verge/v2.4.5" />
                <option value="clash.meta/1.19.20" />
                <option value="Clash" />
              </datalist>
            </label>
          </div>

          <label class="form-control gap-2">
            <span class="label-text text-sm font-medium">订阅地址</span>
            <input
              v-model="form.sourceInput"
              class="input input-bordered w-full font-mono text-xs"
              type="url"
              placeholder="https://example.com/subscription.yaml"
            />
            <span class="text-base-content/55 text-xs">
              输入订阅网址，例如 Clash 订阅链接或节点订阅地址。
            </span>
          </label>
        </section>

        <section class="space-y-4">
          <div class="border-base-300/60 bg-base-200/45 rounded-2xl border p-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="text-sm font-semibold">自动更新</div>
                <div class="text-base-content/55 mt-1 text-xs">
                  后端会按设定周期自动刷新订阅，并写回本地仓库。
                </div>
              </div>
              <input
                v-model="form.autoUpdateEnabled"
                class="toggle toggle-success"
                type="checkbox"
              />
            </div>

            <label class="form-control mt-4 gap-2">
              <span class="label-text text-sm font-medium">更新间隔（分钟）</span>
              <input
                v-model.number="form.autoUpdateIntervalMinutes"
                class="input input-bordered w-full"
                type="number"
                min="5"
                step="5"
                :disabled="!form.autoUpdateEnabled"
              />
            </label>
          </div>
        </section>
      </div>

      <div class="border-base-300/50 mt-6 flex items-center justify-end gap-3 border-t px-1 pt-4">
        <button
          class="btn btn-ghost"
          :disabled="saving"
          @click="dialogOpen = false"
        >
          取消
        </button>
        <button
          class="btn btn-primary"
          :disabled="saving || !canSubmit"
          @click="saveSubscription"
        >
          <span
            v-if="saving"
            class="loading loading-spinner loading-sm"
          />
          确认
        </button>
      </div>
    </DialogWrapper>
  </div>
</template>

<script setup lang="ts">
import {
  createSubscriptionAPI,
  deleteSubscriptionAPI,
  queryNodeCacheAPI,
  refreshSubscriptionAPI,
  updateSubscriptionAPI,
} from '@/api/fastproxy'
import CtrlsBar from '@/components/common/CtrlsBar.vue'
import DialogWrapper from '@/components/common/DialogWrapper.vue'
import { usePaddingForViews } from '@/composables/paddingViews'
import { showNotification } from '@/helper/notification'
import { fromNow } from '@/helper/utils'
import {
  fastProxyBusy,
  fastProxyProfiles,
  fastProxyRepository,
  loadFastProxyWorkspace,
} from '@/store/fastproxyRepository'
import type { FastProxySubscriptionResource } from '@/types/fastproxy'
import { computed, onMounted, reactive, ref, watch } from 'vue'

type SubscriptionFormState = {
  name: string
  sourceInput: string
  userAgent: string
  autoUpdateEnabled: boolean
  autoUpdateIntervalMinutes: number
}

const busy = computed(() => fastProxyBusy.value)
const subscriptions = computed(() => fastProxyRepository.value?.subscriptions || [])
const profiles = computed(() => fastProxyProfiles.value)
const nodeCountsBySubscription = ref<Record<string, number>>({})
const nodeSetMap = computed(() => {
  return new Map((fastProxyRepository.value?.nodeSets || []).map((item) => [item.id, item]))
})
const groupSetMap = computed(() => {
  return new Map((fastProxyRepository.value?.groupSets || []).map((item) => [item.id, item]))
})
const ruleSetMap = computed(() => {
  return new Map((fastProxyRepository.value?.routingRuleSets || []).map((item) => [item.id, item]))
})
const lastUpdated = computed(() => {
  const latest = subscriptions.value[0]?.updatedAt || fastProxyRepository.value?.config.updatedAt
  return latest ? fromNow(latest) : '-'
})

async function refreshNodeCounts() {
  const entries = await Promise.all(
    subscriptions.value.map(async (subscription) => {
      try {
        const { data } = await queryNodeCacheAPI({
          subscriptionId: subscription.id,
          limit: 1,
        })
        return [subscription.id, data.total] as const
      } catch {
        return [subscription.id, 0] as const
      }
    }),
  )
  nodeCountsBySubscription.value = Object.fromEntries(entries)
}

const dialogOpen = ref(false)
const saving = ref(false)
const actionLoading = ref(false)
const editingId = ref<string | null>(null)
const { padding } = usePaddingForViews({
  offsetTop: 0,
  offsetBottom: 0,
})

const form = reactive<SubscriptionFormState>(createEmptyForm())

const canSubmit = computed(() => {
  return Boolean(form.name.trim() && splitLines(form.sourceInput).length)
})

function createEmptyForm(): SubscriptionFormState {
  return {
    name: '',
    sourceInput: '',
    userAgent: 'Clash',
    autoUpdateEnabled: false,
    autoUpdateIntervalMinutes: 60,
  }
}

function resetForm() {
  Object.assign(form, createEmptyForm())
}

function openCreateDialog() {
  editingId.value = null
  resetForm()
  dialogOpen.value = true
}

function openEditDialog(subscription: FastProxySubscriptionResource) {
  editingId.value = subscription.id
  Object.assign(form, {
    name: subscription.name || '',
    sourceInput: subscription.fetch?.sourceInput || subscription.sourceUrl || '',
    userAgent: subscription.fetch?.userAgent || 'Clash',
    autoUpdateEnabled: Boolean(subscription.autoUpdate?.enabled),
    autoUpdateIntervalMinutes: subscription.autoUpdate?.intervalMinutes || 60,
  })
  dialogOpen.value = true
}

async function refreshWorkspace() {
  await loadFastProxyWorkspace()
  await refreshNodeCounts()
}

async function saveSubscription() {
  if (!canSubmit.value || saving.value) return

  saving.value = true
  try {
    const payload = buildPayload()
    if (editingId.value) {
      await updateSubscriptionAPI(editingId.value, payload)
      showNotification({ content: '配置订阅已更新', type: 'alert-success' })
    } else {
      await createSubscriptionAPI(payload)
      showNotification({ content: '配置订阅已创建', type: 'alert-success' })
    }
    dialogOpen.value = false
    await loadFastProxyWorkspace()
    await refreshNodeCounts()
  } catch (error) {
    showNotification({
      content: extractErrorMessage(
        error,
        editingId.value ? '更新配置订阅失败' : '创建配置订阅失败',
      ),
      type: 'alert-error',
      timeout: 5000,
    })
  } finally {
    saving.value = false
  }
}

async function refreshSubscription(id: string) {
  actionLoading.value = true
  try {
    await refreshSubscriptionAPI(id)
    await loadFastProxyWorkspace()
    await refreshNodeCounts()
    showNotification({ content: '订阅已刷新', type: 'alert-success' })
  } catch (error) {
    showNotification({
      content: extractErrorMessage(error, '刷新订阅失败'),
      type: 'alert-error',
      timeout: 5000,
    })
  } finally {
    actionLoading.value = false
  }
}

async function removeSubscription(subscription: FastProxySubscriptionResource) {
  const confirmed = window.confirm(`确认删除订阅“${subscription.name}”吗？`)
  if (!confirmed) return

  actionLoading.value = true
  try {
    await deleteSubscriptionAPI(subscription.id)
    await loadFastProxyWorkspace()
    await refreshNodeCounts()
    showNotification({ content: '订阅已删除', type: 'alert-success' })
  } catch (error) {
    showNotification({
      content: extractErrorMessage(error, '删除订阅失败'),
      type: 'alert-error',
      timeout: 5000,
    })
  } finally {
    actionLoading.value = false
  }
}

function buildPayload(): Partial<FastProxySubscriptionResource> {
  const sources = splitLines(form.sourceInput)
  return {
    name: form.name.trim(),
    originType: 'clash-subscription',
    sourceUrl: sources[0] || '',
    fetch: {
      sourceInput: sources.join('\n'),
      userAgent: form.userAgent.trim() || 'Clash',
    },
    autoUpdate: {
      enabled: form.autoUpdateEnabled,
      intervalMinutes: form.autoUpdateEnabled
        ? Math.max(5, form.autoUpdateIntervalMinutes || 60)
        : 60,
    },
  }
}

function splitLines(value: string) {
  return value
    .split(/\r?\n|\|/g)
    .map((item) => item.trim())
    .filter(Boolean)
}

function getSourceLines(subscription: FastProxySubscriptionResource) {
  return splitLines(subscription.fetch?.sourceInput || subscription.sourceUrl || '')
}

function getAutoUpdateText(subscription: FastProxySubscriptionResource) {
  if (!subscription.autoUpdate?.enabled) {
    return '不会自动更新'
  }
  return `每 ${subscription.autoUpdate.intervalMinutes || 60} 分钟自动更新一次`
}

function getAttachedProfilesCount(subscriptionId: string) {
  return profiles.value.filter((profile) => profile.subscriptionIds?.includes(subscriptionId))
    .length
}

function getSetName(kind: 'node' | 'group' | 'rule', subscription: FastProxySubscriptionResource) {
  if (kind === 'node') {
    return nodeSetMap.value.get(subscription.name)?.name || '-'
  }
  if (kind === 'group') {
    return groupSetMap.value.get(subscription.name)?.name || '-'
  }
  return ruleSetMap.value.get(subscription.name)?.name || '-'
}

function getNodeCount(subscription: FastProxySubscriptionResource) {
  return nodeCountsBySubscription.value[subscription.id] || 0
}

function getGroupCount(subscription: FastProxySubscriptionResource) {
  return groupSetMap.value.get(subscription.name)?.groups?.length || 0
}

function getRuleCount(subscription: FastProxySubscriptionResource) {
  return ruleSetMap.value.get(subscription.name)?.rules?.length || 0
}

function formatTime(value?: string) {
  return value ? fromNow(value) : '-'
}

function extractErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === 'object' &&
    error &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response &&
    'data' in error.response
  ) {
    const data = error.response.data as { message?: string; detail?: string }
    if (typeof data?.message === 'string' && data.message.trim()) {
      return data.message
    }
    if (typeof data?.detail === 'string' && data.detail.trim()) {
      return data.detail
    }
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}

watch(
  () => subscriptions.value.map((subscription) => subscription.id).join('|'),
  () => {
    void refreshNodeCounts()
  },
  { immediate: true },
)

onMounted(() => {
  if (!fastProxyRepository.value) {
    void refreshWorkspace()
  }
})
</script>
