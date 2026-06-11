<template>
  <div
    class="relative flex size-full flex-col overflow-hidden"
    :style="padding"
  >
    <CtrlsBar>
      <div class="flex flex-wrap items-center gap-3 p-2 md:flex-nowrap">
        <div class="text-base-content/65 flex min-w-0 flex-1 flex-wrap items-center gap-2 px-2 text-sm">
          <span class="badge badge-ghost">库存 {{ inventory.length }}</span>
          <span class="badge badge-ghost">手动配置 {{ configuredCount }}</span>
          <span class="badge badge-ghost">本地缓存 {{ cachedCount }}</span>
          <span class="hidden truncate md:inline">这里只管理本地内核二进制和 GitHub 下载凭据。</span>
        </div>
        <button
          class="btn btn-sm"
          :disabled="loading || Boolean(action)"
          @click="load"
        >
          {{ $t('refresh') }}
        </button>
      </div>
    </CtrlsBar>

    <div class="h-full overflow-auto p-3">
      <div class="grid w-full gap-4 pb-8">
        <div
          v-if="error"
          class="grid gap-3 text-sm"
        >
          <div
            v-if="error"
            class="border-error/40 bg-error/10 text-error rounded-xl border p-3"
          >
            {{ error }}
          </div>
        </div>

        <section class="border-base-300/50 bg-base-100/95 rounded-2xl border p-5 shadow-sm">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold">GitHub Token</h2>
              <p class="text-base-content/65 mt-1 text-sm leading-6">
                用于访问 GitHub latest release。Token 会保存到本机设置文件，界面不会回显明文。
              </p>
            </div>
            <span class="badge badge-outline">{{ tokenStatusLabel }}</span>
          </div>

          <div class="mt-4 grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
            <label class="form-control gap-2">
              <span class="label-text text-sm font-medium">Personal access token</span>
              <input
                v-model="githubToken"
                class="input input-bordered w-full"
                type="password"
                :placeholder="tokenPlaceholder"
                autocomplete="off"
              />
            </label>
            <button
              class="btn btn-primary"
              :disabled="action === 'github-token' || githubToken.trim() === ''"
              @click="saveGitHubToken(githubToken)"
            >
              {{ action === 'github-token' ? '保存中...' : '保存 Token' }}
            </button>
            <button
              class="btn btn-outline"
              :disabled="action === 'github-token' || !tokenSetting?.configured"
              @click="saveGitHubToken('')"
            >
              清除
            </button>
          </div>
        </section>

        <section class="border-base-300/50 bg-base-100/95 rounded-2xl border p-5 shadow-sm">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold">内核二进制</h2>
              <p class="text-base-content/65 mt-1 text-sm leading-6">
                检查本地配置和缓存；只有点击检查更新时才访问远程 GitHub Releases。
              </p>
            </div>
            <span
              v-if="loading"
              class="loading loading-spinner loading-sm"
            />
          </div>

          <div
            v-if="inventory.length"
            class="mt-5 grid gap-3 md:grid-cols-2"
          >
            <div
              v-for="item in inventory"
              :key="item.core"
              class="border-base-300/60 bg-base-200/45 rounded-xl border p-4 transition-colors hover:border-primary/50"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <div class="truncate text-lg font-semibold">{{ item.core }}</div>
                  <div class="text-base-content/55 mt-1 text-xs">{{ item.binaryName }}</div>
                </div>
                <span
                  class="badge"
                  :class="item.configured || item.cached ? 'badge-success badge-outline' : 'badge-ghost'"
                >
                  {{ availabilityLabel(item) }}
                </span>
              </div>

              <p class="border-base-300/60 bg-base-100/70 text-base-content/65 mt-3 rounded-xl border p-3 text-xs break-all">
                {{ availabilityPath(item) }}
              </p>

              <div
                v-if="updates[item.core]"
                class="border-base-300/60 bg-base-100/70 mt-3 rounded-xl border p-3 text-xs"
              >
                <p>
                  当前版本：{{ updates[item.core]?.currentVersion || '未安装' }} · 最新版本：{{
                    updates[item.core]?.latestVersion
                  }}
                </p>
                <p class="text-base-content/60 mt-1 break-all">
                  资源：{{ updates[item.core]?.assetName }}
                </p>
              </div>

              <div class="mt-3 flex flex-wrap gap-2">
                <button
                  class="btn btn-sm btn-outline"
                  :disabled="Boolean(action)"
                  @click="checkCoreUpdate(item.core)"
                >
                  {{ action === `check-${item.core}` ? '检查中...' : '检查更新' }}
                </button>
                <button
                  class="btn btn-sm btn-primary"
                  :disabled="Boolean(action) || !updates[item.core]?.updateAvailable"
                  @click="updateCore(item.core)"
                >
                  {{ action === `update-${item.core}` ? '更新中...' : '更新到最新' }}
                </button>
                <button
                  class="btn btn-sm btn-outline"
                  :disabled="Boolean(action)"
                  @click="openUploadDialog(item)"
                >
                  上传本地
                </button>
              </div>
            </div>
          </div>

          <div
            v-else-if="!loading"
            class="text-base-content/55 flex min-h-48 items-center justify-center text-sm"
          >
            暂无内核库存，请检查 FastProxy 后端状态。
          </div>
        </section>
      </div>
    </div>

    <DialogWrapper
      v-model="uploadDialogOpen"
      :title="uploadTarget ? `上传 ${uploadTarget.core} 内核` : '上传内核'"
      box-class="max-w-xl"
    >
      <div class="grid gap-4 p-1">
        <p class="text-base-content/65 text-sm leading-6">
          选择已下载的本地二进制或压缩包，安装后会作为本地缓存优先使用。
          支持直接上传二进制，或上传包含 {{ uploadTarget?.binaryName || 'core' }} 的
          .zip/.tar.gz/.tgz/.gz 文件。
        </p>
        <label class="form-control gap-2">
          <span class="label-text text-sm font-medium">本地文件</span>
          <input
            class="file-input file-input-bordered w-full"
            type="file"
            @change="handleUploadFileChange"
          />
        </label>
        <div class="flex justify-end gap-2">
          <button
            class="btn btn-outline"
            @click="closeUploadDialog"
          >
            取消
          </button>
          <button
            class="btn btn-primary"
            :disabled="Boolean(action) || !uploadTarget || !uploadFile"
            @click="uploadSelectedCore"
          >
            {{ uploadTarget && action === `upload-${uploadTarget.core}` ? '上传中...' : '上传安装' }}
          </button>
        </div>
      </div>
    </DialogWrapper>
  </div>
</template>

<script setup lang="ts">
import {
  checkCoreUpdateAPI,
  fetchCoreInventoryAPI,
  fetchGitHubTokenSettingAPI,
  saveGitHubTokenSettingAPI,
  updateCoreAPI,
  uploadCoreAPI,
} from '@/api/fastproxy'
import CtrlsBar from '@/components/common/CtrlsBar.vue'
import DialogWrapper from '@/components/common/DialogWrapper.vue'
import { usePaddingForViews } from '@/composables/paddingViews'
import { showNotification } from '@/helper/notification'
import type {
  FastProxyCoreId,
  FastProxyCoreInventoryItem,
  FastProxyCoreUpdateInfo,
  FastProxyGitHubTokenSetting,
} from '@/types/fastproxy'
import { computed, onMounted, ref } from 'vue'

const { padding } = usePaddingForViews()

const inventory = ref<FastProxyCoreInventoryItem[]>([])
const tokenSetting = ref<FastProxyGitHubTokenSetting | null>(null)
const githubToken = ref('')
const updates = ref<Partial<Record<FastProxyCoreId, FastProxyCoreUpdateInfo>>>({})
const loading = ref(true)
const action = ref<string | null>(null)
const error = ref('')
const uploadDialogOpen = ref(false)
const uploadTarget = ref<FastProxyCoreInventoryItem | null>(null)
const uploadFile = ref<File | null>(null)

const configuredCount = computed(() => inventory.value.filter((item) => item.configured).length)
const cachedCount = computed(() => inventory.value.filter((item) => item.cached).length)
const tokenPlaceholder = computed(() =>
  tokenSetting.value?.configured ? '已保存，输入新 Token 可覆盖' : 'ghp_...',
)
const tokenStatusLabel = computed(() => {
  if (!tokenSetting.value?.configured) return '未配置'
  if (tokenSetting.value.source === 'environment') return '已通过环境变量配置'
  return '已保存到本机'
})

const load = async () => {
  loading.value = true
  error.value = ''
  try {
    const [coreInventory, tokenStatus] = await Promise.all([
      fetchCoreInventoryAPI(),
      fetchGitHubTokenSettingAPI(),
    ])
    inventory.value = coreInventory.data.cores
    tokenSetting.value = tokenStatus.data
  } catch (err) {
    error.value = getErrorMessage(err, '加载内核状态失败')
  } finally {
    loading.value = false
  }
}

const saveGitHubToken = async (token: string) => {
  action.value = 'github-token'
  error.value = ''
  try {
    const { data } = await saveGitHubTokenSettingAPI(token)
    tokenSetting.value = data
    githubToken.value = ''
    showSuccess(token.trim() ? 'GitHub Token 已保存' : 'GitHub Token 已清除')
  } catch (err) {
    error.value = getErrorMessage(err, '保存 GitHub Token 失败')
  } finally {
    action.value = null
  }
}

const checkCoreUpdate = async (core: FastProxyCoreId) => {
  action.value = `check-${core}`
  error.value = ''
  try {
    const { data } = await checkCoreUpdateAPI(core)
    updates.value = { ...updates.value, [core]: data }
    showSuccess(
      data.updateAvailable
        ? `${core} 发现新版本 ${data.latestVersion}`
        : `${core} 已是最新版本 ${data.latestVersion}`,
    )
  } catch (err) {
    error.value = getErrorMessage(err, '检查更新失败')
  } finally {
    action.value = null
  }
}

const updateCore = async (core: FastProxyCoreId) => {
  action.value = `update-${core}`
  error.value = ''
  try {
    const { data } = await updateCoreAPI(core)
    updates.value = { ...updates.value, [core]: data }
    showSuccess(`${core} 已更新到 ${data.latestVersion}`)
    await load()
  } catch (err) {
    error.value = getErrorMessage(err, '更新内核失败')
  } finally {
    action.value = null
  }
}

const openUploadDialog = (item: FastProxyCoreInventoryItem) => {
  uploadTarget.value = item
  uploadFile.value = null
  uploadDialogOpen.value = true
}

const closeUploadDialog = () => {
  uploadDialogOpen.value = false
  uploadTarget.value = null
  uploadFile.value = null
}

const handleUploadFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  uploadFile.value = input.files?.[0] || null
}

const uploadSelectedCore = async () => {
  if (!uploadTarget.value || !uploadFile.value) return
  const core = uploadTarget.value.core
  action.value = `upload-${core}`
  error.value = ''
  try {
    await uploadCoreAPI(core, uploadFile.value)
    showSuccess(`${core} 已从本地文件安装`)
    closeUploadDialog()
    await load()
  } catch (err) {
    error.value = getErrorMessage(err, '上传安装内核失败')
  } finally {
    action.value = null
  }
}

const availabilityLabel = (item: FastProxyCoreInventoryItem) => {
  if (item.configured) return '手动配置'
  if (item.cached) return '本地缓存'
  return '首次启动下载'
}

const availabilityPath = (item: FastProxyCoreInventoryItem) => {
  if (item.configuredPath) return item.configuredPath
  if (item.cachedPath) return `${item.cachedVersion || 'cached'}: ${item.cachedPath}`
  return '本地未发现内核，首次启动或手动更新时会下载匹配当前系统的最新版本。'
}

const getErrorMessage = (err: unknown, fallback: string) => {
  if (typeof err === 'object' && err && 'response' in err) {
    const response = (err as { response?: { data?: { message?: string } } }).response
    if (response?.data?.message) return response.data.message
  }
  return err instanceof Error ? err.message : fallback
}

const showSuccess = (content: string) => {
  showNotification({
    content,
    type: 'alert-success',
    timeout: 3000,
  })
}

onMounted(() => {
  load()
})
</script>
