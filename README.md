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
├── main.jsx                              
├── lib/
│   ├── utils/
│   │   ├── UserContext.jsx              
│   │   ├── financeAdapters.js           
│   │   └── apiResponse.js               
│   ├── repositories/
│   │   ├── authRepository.js           
│   │   ├── categoryRepository.js        
│   │   └── recommendationRepository.js  
│   └── api/
│       └── recommendationApi.js         
├── components/auth/
│   └── ProtectedRoute.jsx               
└── features/
    ├── dashboard/pages/Dashboard.jsx    
    ├── transactions/pages/Transactions.jsx 
    └── recommendations/pages/Recommendations.jsx 
```

