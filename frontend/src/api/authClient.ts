import axios from 'axios'

import { API_BASE } from '@/constants'
import { Configuration, OauthApi } from '@/api/generated'

/**
 * A bare axios instance with NO response interceptors attached.
 * Used exclusively for auth calls (validate / refresh / logout) so that
 * the main apiClient interceptor cannot intercept them and cause an
 * infinite refresh loop.
 */
const authAxios = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
})

const authConfiguration = new Configuration({ basePath: API_BASE })

export const authOauthApi = new OauthApi(authConfiguration, undefined, authAxios)
