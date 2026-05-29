export const formatIDR = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0)

export function getCategoryIdByName(name, apiCategories = []) {
  if (!name) return null
  const found = apiCategories.find(
    (c) =>
      c.name?.toLowerCase() === name?.toLowerCase() ||
      c.label?.toLowerCase() === name?.toLowerCase(),
  )
  return found?.id || null
}

export function formatCategoryLabel(value, apiCategories = []) {
  if (!value) return 'Lainnya'

  
  if (apiCategories.length > 0) {
    const found = apiCategories.find(
      (c) =>
        c.name?.toLowerCase() === value?.toLowerCase() ||
        c.label?.toLowerCase() === value?.toLowerCase(),
    )
    if (found) return found.label || found.name
  }

  
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function normalizeCategory(category = {}) {
  const name  = category.name  || 'lainnya'
  const label = category.label || formatCategoryLabel(name)

  return {
    id:         category.id || null,
    user_id:    category.user_id ?? null,
    name,
    label,
    type:       category.type       || 'expense',
    icon:       category.icon       || 'circle',
    is_default: category.is_default ?? (category.user_id === null),
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

  const nickname      = read('nickname', 'nick_name') || ''
  const name          = read('name', 'full_name') || nickname || 'Pengguna SmartFinance'
  const email         = read('email') || ''
  const avatar        =
    read('avatar') ||
    name.split(' ').filter(Boolean).map((p) => p[0]).join('').slice(0, 2).toUpperCase() ||
    'SF'

  const monthlyIncome     = Number(read('monthlyIncome', 'monthly_income') ?? 0)
  const savingTarget      = Number(read('savingTarget', 'saving_target', 'target_saving') ?? 0)
  const financialGoal     = read('financialGoal', 'financial_goal') || ''
  const riskProfile       = read('riskProfile', 'risk_profile') || 'moderate'
  const ageRange          = read('ageRange', 'age_range') || ''
  const spendingStyle     = read('spendingStyle', 'spending_style') || ''
  const mainPriority      = read('mainPriority', 'main_priority') || ''
  const onboardingCompleted = Boolean(read('onboardingCompleted', 'onboarding_completed'))
  const emailVerifiedAt   = read('emailVerifiedAt', 'email_verified_at') || null

  return {
    ...user,
    ...profile,
    id:                   read('id', 'user_id') || user.id,
    name,
    email,
    avatar,
    nickname,
    monthlyIncome,        monthly_income:        monthlyIncome,
    savingTarget,         saving_target:         savingTarget,
    financialGoal,        financial_goal:        financialGoal,
    riskProfile,          risk_profile:          riskProfile,
    ageRange,             age_range:             ageRange,
    spendingStyle,        spending_style:        spendingStyle,
    mainPriority,         main_priority:         mainPriority,
    onboardingCompleted,  onboarding_completed:  onboardingCompleted,
    status:               read('status') || 'active',
    emailVerifiedAt,      email_verified_at:     emailVerifiedAt,
  }
}

export function toApiProfilePayload(user = {}) {
  const payload = {}
  if (user.name          !== undefined) payload.name          = user.name
  if (user.email         !== undefined) payload.email         = user.email
  if (user.nickname      !== undefined) payload.nickname      = user.nickname

  const income = user.monthlyIncome ?? user.monthly_income
  if (income !== undefined) payload.monthly_income = Number(income)

  const saving = user.savingTarget ?? user.saving_target ?? user.target_saving
  if (saving !== undefined) payload.saving_target = Number(saving)

  const goal = user.financialGoal ?? user.financial_goal
  if (goal !== undefined) payload.financial_goal = goal

  const risk = user.riskProfile ?? user.risk_profile
  if (risk !== undefined) payload.risk_profile = risk

  const age = user.ageRange ?? user.age_range
  if (age !== undefined) payload.age_range = age

  const style = user.spendingStyle ?? user.spending_style
  if (style !== undefined) payload.spending_style = style

  const priority = user.mainPriority ?? user.main_priority
  if (priority !== undefined) payload.main_priority = priority

  const onboarded = user.onboardingCompleted ?? user.onboarding_completed
  if (onboarded !== undefined) payload.onboarding_completed = Boolean(onboarded)

  return payload
}

export function normalizeTransaction(transaction = {}, apiCategories = []) {
  
  const categoryName  = transaction.category_name || transaction.category || 'lainnya'
  
  const categoryLabel = transaction.category_label ||
    formatCategoryLabel(categoryName, apiCategories)

  const transactionDate =
    transaction.transaction_date ||
    transaction.date ||
    transaction.created_at?.slice(0, 10) ||
    new Date().toISOString().slice(0, 10)

  return {
    id:               transaction.id,
    user_id:          transaction.user_id,
    category_id:      transaction.category_id || null,
    category:         categoryName,
    category_name:    categoryName,
    categoryLabel,
    category_label:   categoryLabel,
    title:            transaction.title || 'Transaksi',
    description:      transaction.description || transaction.title || '',
    type:             transaction.type || 'expense',
    amount:           Number(transaction.amount || 0),
    date:             transactionDate,
    transaction_date: transactionDate,
    note:             transaction.note || '',
    created_at:       transaction.created_at || null,
    updated_at:       transaction.updated_at || null,
  }
}

export function toApiTransactionPayload(form = {}) {
  const payload = {
    title:            form.title?.trim() || '',
    description:      form.description?.trim() || form.title?.trim() || '',
    type:             form.type,
    category:         form.category || 'lainnya',
    amount:           Number(form.amount || 0),
    transaction_date: form.transaction_date || form.date || new Date().toISOString().slice(0, 10),
    note:             form.note?.trim() || '',
  }

  
  
  const catId = Number(form.category_id)
  if (catId && catId > 0) {
    payload.category_id = catId
  }

  return payload
}

export function normalizeRecommendation(item = {}) {
  return {
    id:                  item.id || item.title || Math.random().toString(36).slice(2),
    recommendation_type: item.recommendation_type || item.type || 'general',
    title:               item.title || 'Rekomendasi Finansial',
    text:                item.text  || item.message || item.description || '',
    message:             item.message || item.text || '',
    priority:            item.priority || 'medium',
    source:              item.source   || 'rule_based',
    action:              item.action   || '',
    expires_at:          item.expires_at || null,
    
    label:               item.label      || null,   
    confidence:          item.confidence || null,   
    savings_pct:         item.savings_pct || null,
    category:            item.category   || null,   
    financial_health:    item.financial_health || null,
  }
}
