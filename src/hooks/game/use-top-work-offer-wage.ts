import { useWorkOffers } from '@/api/warera-api'

export const useTopWorkOfferWage = () => {
  const workOffers = useWorkOffers(1)
  return workOffers.data?.[0]?.wage ?? 0
}
