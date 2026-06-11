import { fetchConfigs } from './config'
import { initConnections, stopConnections } from './connections'
import { initLogs, stopLogs } from './logs'
import { initSatistic, stopSatistic } from './overview'
import { fetchProxies } from './proxies'
import { fetchRules } from './rules'

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
