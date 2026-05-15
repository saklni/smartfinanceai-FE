import * as transactionApi from '../api/transactionApi'

export const formatIDR = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0)

export const financeRepository = {
  async getTransactions() {
    return transactionApi.getTransactions()
  },

  async createTransaction(payload) {
    return transactionApi.createTransaction(payload)
  },

  async updateTransaction(id, payload) {
    return transactionApi.updateTransaction(id, payload)
  },

  async deleteTransaction(id) {
    return transactionApi.deleteTransaction(id)
  },
}
