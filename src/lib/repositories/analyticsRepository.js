import * as analyticsApi from '../api/analyticsApi'

export const analyticsRepository = {
  async getDashboardAnalytics() {
    const [summary, categories, trend] = await Promise.all([
      analyticsApi.getSummary(),
      analyticsApi.getCategoryData(),
      analyticsApi.getTrendData(),
    ])
    return { summary, categories, trend }
  },
}
