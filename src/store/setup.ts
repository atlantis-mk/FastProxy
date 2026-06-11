import type { Backend } from '@/types'
import { useStorage } from '@vueuse/core'
import { isEqual, omit } from 'lodash'
import { v4 as uuid } from 'uuid'
import { computed, ref } from 'vue'
import { sourceIPLabelList } from './settings'

export const backendList = useStorage<Backend[]>('setup/api-list', [])
export const activeUuid = useStorage<string>('setup/active-uuid', '')
export const localFastProxyBackend: Backend = {
  uuid: '__local_fastproxy__',
  protocol: 'http',
  host: '127.0.0.1',
  port: '43171',
  secondaryPath: '',
  password: '',
  label: 'Local FastProxy',
}
const devBackend: Backend = {
  uuid: '__dev_backend__',
  protocol: 'http',
  host: import.meta.env.VITE_BACKEND_HOST || '127.0.0.1',
  port: import.meta.env.VITE_BACKEND_PORT || '43171',
  secondaryPath: '',
  password: import.meta.env.VITE_BACKEND_PASSWORD || '',
  label: 'FastProxy Dev Backend',
}
export const activeBackendFlavor = ref<'fastproxy' | 'controller' | 'unknown'>('unknown')
export const activeBackend = computed(
  () =>
    backendList.value.find((backend) => backend.uuid === activeUuid.value) ||
    (import.meta.env.DEV ? devBackend : localFastProxyBackend),
)

export const setActiveBackendFlavor = (flavor: 'fastproxy' | 'controller' | 'unknown') => {
  activeBackendFlavor.value = flavor
}

export const switchActiveBackend = (direction: 1 | -1) => {
  if (backendList.value.length < 2) {
    return null
  }

  const currentIndex = backendList.value.findIndex((backend) => backend.uuid === activeUuid.value)
  const startIndex = currentIndex >= 0 ? currentIndex : 0
  const nextIndex = (startIndex + direction + backendList.value.length) % backendList.value.length

  const nextBackend = backendList.value[nextIndex]

  if (!nextBackend) {
    return null
  }

  activeUuid.value = nextBackend.uuid
  return nextBackend
}

export const addBackend = (backend: Omit<Backend, 'uuid'>) => {
  const currentEnd = backendList.value.find((end) => {
    return isEqual(omit(end, 'uuid'), backend)
  })

  if (currentEnd) {
    activeUuid.value = currentEnd.uuid
    return
  }

  const id = uuid()

  backendList.value.push({
    ...backend,
    uuid: id,
  })
  activeUuid.value = id
}

export const updateBackend = (uuid: string, backend: Omit<Backend, 'uuid'>) => {
  const index = backendList.value.findIndex((end) => end.uuid === uuid)
  if (index !== -1) {
    backendList.value[index] = {
      ...backend,
      uuid,
    }
  }
}

export const removeBackend = (uuid: string) => {
  backendList.value = backendList.value.filter((end) => end.uuid !== uuid)
  sourceIPLabelList.value.forEach((label) => {
    if (label.scope && label.scope.includes(uuid)) {
      label.scope = label.scope.filter((scope) => scope !== uuid)
      if (!label.scope.length) {
        delete label.scope
      }
    }
  })
}
