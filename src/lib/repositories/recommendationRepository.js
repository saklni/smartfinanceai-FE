import * as recommendationApi from '../api/recommendationApi'

export const recommendationRepository = {
  async getRecommendations() {
    return recommendationApi.getRecommendations()
  },
}
