import { healthApi } from "#/api/clients"
import { queryKeys } from "#/api/queryKeys"
import { useQuery } from '@tanstack/react-query'

export function useHealth() {

    const { data: healthStatus } = useQuery({
        queryKey: queryKeys.health,
        queryFn: async () => {
            const response = await healthApi.healthHealthGet()
            return response.data
        },
        // retry: 1,
        retryDelay: 5000,
    })
    
    return healthStatus
}
