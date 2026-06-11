<template>
  <div class="flex items-center gap-1 overflow-hidden">
    <img
      :src="backendLogo"
      class="h-4 w-4 rounded-xs"
    />
    <span
      class="text-base-content/60 truncate"
      @mouseenter="checkTruncation"
    >
      {{ backendVersionText }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { isSingBox, version } from '@/api'
import MetacubexLogo from '@/assets/images/metacubex.jpg'
import SingBoxLogo from '@/assets/images/sing-box.svg'
import { checkTruncation } from '@/helper/tooltip'
import {
  fastProxySelectedCore,
  fastProxySelectedCoreVersionText,
  loadFastProxyCoreInventory,
} from '@/store/fastproxyRepository'
import { activeBackendFlavor } from '@/store/setup'
import { computed, onMounted, watch } from 'vue'

const isFastProxy = computed(() => activeBackendFlavor.value === 'fastproxy')
const backendLogo = computed(() => {
  if (isFastProxy.value) {
    return fastProxySelectedCore.value === 'sing-box' ? SingBoxLogo : MetacubexLogo
  }
  return isSingBox.value ? SingBoxLogo : MetacubexLogo
})
const backendVersionText = computed(() => {
  if (isFastProxy.value) {
    return fastProxySelectedCoreVersionText.value
  }
  return version.value
})

const ensureFastProxyVersion = async () => {
  if (!isFastProxy.value) return
  await loadFastProxyCoreInventory().catch(() => undefined)
}

watch(isFastProxy, ensureFastProxyVersion, { immediate: true })

onMounted(ensureFastProxyVersion)
</script>
