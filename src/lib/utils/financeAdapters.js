export const categoryOptions = [
  { id: 1, name: 'Food', label: 'Makanan', type: 'expense', icon: 'utensils' },
  { id: 2, name: 'Transport', label: 'Transportasi', type: 'expense', icon: 'car' },
  { id: 3, name: 'Lifestyle', label: 'Gaya Hidup', type: 'expense', icon: 'coffee' },
  { id: 4, name: 'Shopping', label: 'Belanja', type: 'expense', icon: 'shopping-bag' },
  { id: 5, name: 'Education', label: 'Pendidikan', type: 'expense', icon: 'book-open' },
  { id: 6, name: 'Subscription', label: 'Langganan', type: 'expense', icon: 'repeat' },
  { id: 7, name: 'Health', label: 'Kesehatan', type: 'expense', icon: 'heart-pulse' },
  { id: 8, name: 'Bills', label: 'Tagihan', type: 'expense', icon: 'receipt' },
  { id: 9, name: 'Other', label: 'Lainnya', type: 'expense', icon: 'circle' },
  { id: 10, name: 'Income', label: 'Pemasukan', type: 'income', icon: 'wallet' },
]

export const formatCategoryLabel = (value) => {
  const category = categoryOptions.find(
    (item) => item.name === value || item.label === value || Number(item.id) === Number(value),
  )

  return category?.label || value || 'Lainnya'
}

export function getCategoryIdByName(name) {
  return categoryOptions.find((category) => category.name === name || category.label === name)?.id || null
}

export function normalizeCategory(category = {}) {
  const name = category.name || category.category || 'Other'
  const label = category.label || formatCategoryLabel(name)

  return {
    id: category.id || getCategoryIdByName(name),
    user_id: category.user_id ?? null,
    name,
    label,
    type: category.type || 'expense',
    icon: category.icon || 'circle',
    created_at: category.created_at || null,
  }
}

export function normalizeUser(user = {}) {
  const profile = user.profile || user.user_profile || user.userProfile || {}

  const read = (...keys) => {
    for (const key of keys) {
      if (user[key] !== undefined && user[key] !== null && user[key] !== '') return user[key]
      if (profile[key] !== undefined && profile[key] !== null && profile[key] !== '') return profile[key]
    }
    return undefined
  }

  const nickname = read('nickname', 'nick_name') || ''
  const name = read('name', 'full_name') || nickname || 'Pengguna SmartFinance'
  const email = read('email') || ''
  const avatar =
    read('avatar') ||
    name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() ||
    'SF'

  const monthlyIncome = Number(read('monthlyIncome', 'monthly_income') ?? 0)
  const savingTarget = Number(read('savingTarget', 'saving_target', 'target_saving') ?? 0)
  const financialGoal = read('financialGoal', 'financial_goal') || ''
  const riskProfile = read('riskProfile', 'risk_profile') || 'moderate'
  const ageRange = read('ageRange', 'age_range') || ''
  const spendingStyle = read('spendingStyle', 'spending_style') || ''
  const mainPriority = read('mainPriority', 'main_priority') || ''
  const onboardingCompleted = Boolean(read('onboardingCompleted', 'onboarding_completed'))
  const emailVerifiedAt = read('emailVerifiedAt', 'email_verified_at') || null

  return {
    ...user,
    ...profile,
    id: read('id', 'user_id') || user.id,
    name,
    email,
    avatar,
    nickname,
    monthlyIncome,
    monthly_income: monthlyIncome,
    savingTarget,
    saving_target: savingTarget,
    financialGoal,
    financial_goal: financialGoal,
    riskProfile,
    risk_profile: riskProfile,
    ageRange,
    age_range: ageRange,
    spendingStyle,
    spending_style: spendingStyle,
    mainPriority,
    main_priority: mainPriority,
    onboardingCompleted,
    onboarding_completed: onboardingCompleted,
    status: read('status') || 'active',
    emailVerifiedAt,
    email_verified_at: emailVerifiedAt,
  }
}

export function toApiProfilePayload(user = {}) {
  const payload = {}

  if (user.name !== undefined) payload.name = user.name
  if (user.email !== undefined) payload.email = user.email
  if (user.nickname !== undefined) payload.nickname = user.nickname

  if (user.monthlyIncome !== undefined || user.monthly_income !== undefined) {
    payload.monthly_income = Number(user.monthlyIncome ?? user.monthly_income)
  }

  if (user.savingTarget !== undefined || user.saving_target !== undefined || user.target_saving !== undefined) {
    payload.saving_target = Number(user.savingTarget ?? user.saving_target ?? user.target_saving)
  }

  if (user.financialGoal !== undefined || user.financial_goal !== undefined) {
    payload.financial_goal = user.financialGoal ?? user.financial_goal
  }

  if (user.riskProfile !== undefined || user.risk_profile !== undefined) {
    payload.risk_profile = user.riskProfile ?? user.risk_profile
  }

  if (user.ageRange !== undefined || user.age_range !== undefined) {
    payload.age_range = user.ageRange ?? user.age_range
  }

  if (user.spendingStyle !== undefined || user.spending_style !== undefined) {
    payload.spending_style = user.spendingStyle ?? user.spending_style
  }

  if (user.mainPriority !== undefined || user.main_priority !== undefined) {
    payload.main_priority = user.mainPriority ?? user.main_priority
  }

  if (user.onboardingCompleted !== undefined || user.onboarding_completed !== undefined) {
    payload.onboarding_completed = Boolean(user.onboardingCompleted ?? user.onboarding_completed)
  }

  return payload
}

export function normalizeTransaction(transaction = {}) {
  const categoryName = transaction.category?.name || transaction.category || transaction.category_name || 'Other'
  const transactionDate =
    transaction.transaction_date ||
    transaction.date ||
    transaction.created_at?.slice(0, 10) ||
    new Date().toISOString().slice(0, 10)

  return {
    id: transaction.id,
    user_id: transaction.user_id,
    category_id: transaction.category_id || getCategoryIdByName(categoryName),
    title: transaction.title || transaction.name || 'Transaksi',
    type: transaction.type || 'expense',
    category: categoryName,
    categoryLabel: formatCategoryLabel(categoryName),
    amount: Number(transaction.amount || 0),
    date: transactionDate,
    transaction_date: transactionDate,
    note: transaction.note || '',
    created_at: transaction.created_at || null,
    updated_at: transaction.updated_at || null,
  }
}

export function toApiTransactionPayload(form = {}) {
  const category = form.category || 'Other'
  return {
    title: form.title?.trim(),
    type: form.type,
    category_id: form.category_id || getCategoryIdByName(category),
    category,
    amount: Number(form.amount || 0),
    transaction_date: form.transaction_date || form.date,
    note: form.note?.trim() || '',
  }
}

export function normalizeRecommendation(item = {}) {
  return {
    id: item.id || item.title,
    recommendation_type: item.recommendation_type || item.type || 'general',
    title: item.title || 'Rekomendasi Finansial',
    text: item.text || item.message || item.description || '',
    message: item.message || item.text || item.description || '',
    priority: item.priority || 'medium',
    source: item.source || 'rule_based',
    action: item.action || '',
    expires_at: item.expires_at || null,
  }
}
