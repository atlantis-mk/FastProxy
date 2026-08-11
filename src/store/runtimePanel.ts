import { fetchConfigs } from '@/assembly/config'
import { fetchProxies } from '@/assembly/proxies'
import { fetchRules } from '@/assembly/rules'
import { initConnections, stopConnections } from './connections'
import { initLogs, stopLogs } from './logs'
import { initSatistic, stopSatistic } from './overview'

export const stopRuntimePanelData = () => {
  stopConnections()
  stopLogs()
  stopSatistic()
}

export const initRuntimePanelData = async () => {
  initConnections()
  initLogs()
  initSatistic()

  await Promise.allSettled([fetchConfigs(), fetchProxies(), fetchRules()])
}
