# SmartFinance AI — Frontend

React + Vite frontend untuk SmartFinance AI. Full API mode — tidak ada localStorage data lagi.

## Setup

```bash
npm install
cp .env.example .env   # isi VITE_API_BASE_URL dan VITE_GOOGLE_CLIENT_ID
npm run dev
```

## Environment Variables

| Variable | Keterangan |
|---|---|
| `VITE_API_BASE_URL` | URL backend Express (contoh: `http://localhost:5000/api`) |
| `VITE_OTP_LENGTH` | Panjang kode OTP (default: `6`) |
| `VITE_GOOGLE_CLIENT_ID` | Client ID dari Google Cloud Console untuk Login dengan Google |

## Setup Google Sign-In

1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Buat project → **APIs & Services** → **Credentials**
3. **Create Credentials** → **OAuth 2.0 Client IDs** → **Web application**
4. Isi **Authorized JavaScript origins**: `http://localhost:5173` (dev) dan domain produksi
5. Salin **Client ID** → isi ke `VITE_GOOGLE_CLIENT_ID` di `.env`
6. Pastikan backend memiliki endpoint `POST /api/auth/google`

## File yang Dihapus (vs versi sebelumnya)

| File | Alasan |
|---|---|
| `src/lib/storage/localFinanceRepository.js` | localStorage CRUD tidak dibutuhkan |
| `src/lib/storage/financeStorage.js` | Compatibility layer local mode |
| `src/mocks/finance.mock.js` | Data dummy offline |
| `src/lib/analytics/financeAnalytics.js` | Kalkulasi digantikan `/api/analytics/*` |

## Perubahan Utama

- `src/config/env.js` — `isApiMode` dan `dataSource` dihapus, selalu API
- Semua `src/lib/repositories/*` — bersih tanpa cabang `isApiMode`
- `src/features/auth/pages/Auth.jsx` — tambah Google Sign-In button (GSI SDK)
- `src/features/auth/pages/VerifyOtp.jsx` — hapus referensi `isApiMode`
- `src/lib/api/analyticsApi.js` — tambah `getCategoryData` dan `getTrendData`
- `src/lib/repositories/analyticsRepository.js` — fetch 3 endpoint sekaligus
