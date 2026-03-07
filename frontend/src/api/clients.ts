import axios from 'axios'

import { API_BASE } from '@/constants'
import { Configuration, DashboardApi, HealthApi, OauthApi } from '@/api/generated'

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

const configuration = new Configuration({
  basePath: API_BASE,
})

export const dashboardApi = new DashboardApi(configuration, undefined, apiClient)
export const healthApi = new HealthApi(configuration, undefined, apiClient)
export const oauthApi = new OauthApi(configuration, undefined, apiClient)