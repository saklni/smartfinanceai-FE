import * as categoryApi from '../api/categoryApi'

export const categoryRepository = {
  async getCategories() {
    return categoryApi.getCategories()
  },

  async createCategory(payload) {
    return categoryApi.createCategory(payload)
  },
}
