# SmartFinance AI — Frontend React + Vite (v2)

Frontend web app SmartFinance AI, dibangun dengan React, Vite, dan Recharts.

---

## Perubahan v2 (Fixed)

| # | Masalah | Status |
|---|---------|--------|
| 1 | `categoryOptions` hardcoded dengan id/name statis yang bisa beda dari DB | ✅ Dihapus, diganti `useLiveCategories()` |
| 2 | `normalizeRecommendation()` crash saat terima format AI | ✅ Diperluas handle kedua format |
| 3 | `ProtectedRoute` memanggil `/auth/me` di setiap navigasi | ✅ Validasi sekali saat mount |
| 4 | Tidak ada global user state — setiap halaman fetch sendiri | ✅ Tambah `UserContext` |
| 5 | `persistToken()` typo level unwrap — token tidak tersimpan | ✅ Diperbaiki |
| 6 | Dashboard insight hardcoded rule-based, tidak update dari AI | ✅ Tampilkan label AI jika ada |
| 7 | Halaman Recommendations tidak punya UI untuk label Boros/Normal/Hemat | ✅ Ditambahkan `AiLabelBadge` + card variants |
| 8 | `form.category` default `'Food'` — bisa kosong jika kategori dari DB berbeda | ✅ Default dari kategori pertama live API |
| 9 | `formatCategoryLabel()` mencari di static array, tidak di DB | ✅ Terima `apiCategories` sebagai param |
| 10 | File duplikat `features/auth/pages/Onboarding.jsx` | ✅ Dijadikan re-export yang benar |

---

## Prasyarat

- Node.js v18 atau lebih baru
- Backend Express sudah berjalan di port 5000
- (Opsional) Python AI API berjalan di port 8001 dan 8002

---

## Langkah 1 — Setup

```bash
npm install
```

Buat file `.env`:

```bash
cp .env.example .env
```

Isi `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=   # opsional
```

---

## Langkah 2 — Jalankan

```bash
npm run dev
```

Buka http://localhost:5173

---

## Struktur File (yang dimodifikasi)

```
src/
├── main.jsx                              ← v2: wrap dengan UserProvider
├── lib/
│   ├── utils/
│   │   ├── UserContext.jsx               ← BARU: global user state
│   │   ├── financeAdapters.js            ← v2: hapus categoryOptions, perluas normalizeRecommendation
│   │   └── apiResponse.js               ← v2: simplifikasi unwrap, tidak agresif
│   ├── repositories/
│   │   ├── authRepository.js            ← v2: fix persistToken level
│   │   ├── categoryRepository.js        ← v2: tambah useLiveCategories() hook
│   │   └── recommendationRepository.js  ← v2: tambah useRecommendations() hook
│   └── api/
│       └── recommendationApi.js         ← v2: guard Array.isArray
├── components/auth/
│   └── ProtectedRoute.jsx               ← v2: validasi sekali, pakai UserContext
└── features/
    ├── dashboard/pages/Dashboard.jsx    ← v2: pakai useUser(), tampilkan AI label
    ├── transactions/pages/Transactions.jsx ← v2: pakai useLiveCategories()
    └── recommendations/pages/Recommendations.jsx ← v2: UI lengkap untuk AI cards
```

---

## Format Data Rekomendasi yang Didukung

### Saat AI aktif (source: 'llm')

```json
[
  {
    "id": "ai-label",
    "recommendation_type": "ai_classification",
    "title": "Profil Keuangan: Boros",
    "text": "Pengeluaran melebihi 90%...",
    "priority": "high",
    "source": "llm",
    "label": "Boros",
    "confidence": 0.92,
    "savings_pct": 4.0
  },
  {
    "id": "ai-summary",
    "recommendation_type": "ai_summary",
    "title": "Ringkasan Keuangan Bulan Ini",
    "text": "Teks panjang dari Groq LLM...",
    "source": "llm"
  },
  {
    "id": "ai-cat-makanan_minuman",
    "recommendation_type": "ai_category",
    "title": "Tips Makanan Minuman",
    "text": "...",
    "category": "makanan_minuman",
    "source": "llm"
  }
]
```

### Saat AI tidak tersedia (fallback rule-based)

```json
[
  {
    "id": "top-category",
    "recommendation_type": "spending_pattern",
    "title": "Kategori pengeluaran terbesar",
    "text": "...",
    "priority": "high",
    "source": "rule_based",
    "label": null,
    "confidence": null
  }
]
```

---

## UserContext

```jsx
// Dari komponen mana pun
import { useUser } from '../lib/utils/UserContext'

function MyComponent() {
  const { user, setUser, refreshUser } = useUser()
  // user sudah ter-validasi oleh ProtectedRoute
  // refreshUser() → panggil GET /auth/me lagi jika perlu update
}
```

---

## useLiveCategories

```jsx
import { useLiveCategories } from '../lib/repositories/categoryRepository'

function MyForm() {
  const { categories, expenseCategories, incomeCategories, loading } = useLiveCategories()
  // categories: semua kategori dari API
  // expenseCategories: filter type='expense'
  // incomeCategories: filter type='income'
}
```

---

*SmartFinance AI v2 Frontend — Coding Camp 2026 DBS Foundation*
