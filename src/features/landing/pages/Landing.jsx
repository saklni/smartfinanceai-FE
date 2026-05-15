import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Bot,
  CheckCircle2,
  CreditCard,
  LineChart,
  LockKeyhole,
  PieChart,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  WalletCards,
  Zap,
} from 'lucide-react';
import ThemeToggle from '../../../components/common/ThemeToggle';

const metrics = [
  ['Real-time', 'Ringkasan cashflow'],
  ['Lebih rapi', 'Catatan transaksi'],
  ['Lebih sadar', 'Pola pengeluaran'],
];

const features = [
  {
    title: 'Catat Transaksi Lebih Mudah',
    description: 'Simpan pemasukan dan pengeluaran harian dalam kategori yang jelas, tanpa proses yang ribet.',
    icon: WalletCards,
  },
  {
    title: 'Dashboard Keuangan Visual',
    description: 'Lihat saldo, cashflow, kategori pengeluaran terbesar, dan perkembangan finansial secara cepat.',
    icon: BarChart3,
  },
  {
    title: 'Insight Finansial Cerdas',
    description: 'Dapatkan rekomendasi sederhana berdasarkan kebiasaan transaksi agar keputusan uang lebih terarah.',
    icon: Bot,
  },
];

const transactions = [
  ['Makan & Minum', '-Rp185rb', 'expense'],
  ['Freelance', '+Rp750rb', 'income'],
  ['Hiburan', '-Rp120rb', 'expense'],
];

const workflow = [
  ['01', 'Catat transaksi harian'],
  ['02', 'Pantau cashflow bulanan'],
  ['03', 'Kenali kategori paling boros'],
  ['04', 'Ikuti rekomendasi finansial'],
];

export default function Landing({ theme, onToggleTheme }) {
  useEffect(() => {
    const items = document.querySelectorAll('.scroll-reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    }, { threshold: 0.18 });

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing landing-pro">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      <header className="landing-nav pro-nav">
        <Link to="/" className="brand dark brand-pro">
          <div className="brand-mark"><WalletCards size={24} /></div>
          <b>SmartFinance <span>AI</span></b>
        </Link>

        <nav className="nav-menu" aria-label="Landing navigation">
          <a href="#features">Fitur</a>
          <a href="#how-it-works">Cara Kerja</a>
          <a href="#security">Keamanan</a>
        </nav>

        <div className="nav-actions">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <Link to="/login">Login</Link>
          <Link className="btn small nav-cta" to="/register">Mulai Gratis</Link>
        </div>
      </header>

      <main>
        <section className="hero pro-hero">
          <div className="hero-copy pro-copy reveal-up">
            <div className="eyebrow pro-eyebrow">
              <Sparkles size={16} /> Insight keuangan cerdas untuk generasi muda
            </div>

            <h1>Kelola uang lebih cerdas, rapi, dan percaya diri.</h1>

            <p>
              SmartFinance AI membantu kamu mencatat transaksi, memahami pola pengeluaran,
              dan mengambil keputusan finansial yang lebih baik melalui insight yang mudah dipahami.
            </p>

            <div className="hero-actions">
              <Link className="btn btn-glow" to="/register">
                Mulai Kelola Keuangan <ArrowRight size={18} />
              </Link>
              <Link className="btn ghost glass-btn" to="/login">
                Masuk ke Akun
              </Link>
            </div>

            <div className="hero-metrics" aria-label="Keunggulan SmartFinance AI">
              {metrics.map(([value, label]) => (
                <div className="metric-card" key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-visual reveal-float" aria-label="Preview dashboard SmartFinance AI">
            <div className="floating-tag tag-left">
              <BellRing size={16} /> Pengeluaran naik 12%
            </div>
            <div className="floating-tag tag-right">
              <CheckCircle2 size={16} /> Budget masih aman
            </div>

            <div className="dashboard-preview">
              <div className="preview-top">
                <div>
                  <span>Saldo Bulan Ini</span>
                  <h2>Rp3,72 jt</h2>
                </div>
                <div className="preview-icon"><Sparkles size={22} /></div>
              </div>

              <div className="preview-chart" aria-hidden="true">
                <span style={{ height: '42%' }} />
                <span style={{ height: '68%' }} />
                <span style={{ height: '52%' }} />
                <span style={{ height: '86%' }} />
                <span style={{ height: '64%' }} />
                <span style={{ height: '92%' }} />
                <span style={{ height: '74%' }} />
              </div>

              <div className="preview-grid">
                <div><small>Pemasukan</small><b>Rp4,3 jt</b></div>
                <div><small>Pengeluaran</small><b>Rp1,5 jt</b></div>
              </div>

              <div className="insight-strip">
                <Zap size={17} /> Kurangi pengeluaran hiburan 15% agar target tabungan tetap tercapai.
              </div>
            </div>

            <div className="transaction-float">
              <div className="mini-title"><CreditCard size={17} /> Transaksi Terbaru</div>
              {transactions.map(([name, amount, type]) => (
                <div className="mini-transaction" key={name}>
                  <span className={type} />
                  <p>{name}</p>
                  <b className={type}>{amount}</b>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="feature-grid pro-features scroll-reveal" id="features">
          {features.map(({ title, description, icon: Icon }) => (
            <article className="feature pro-feature magnetic" key={title}>
              <div className="feature-icon"><Icon size={28} /></div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </section>

        <section className="startup-section scroll-reveal" id="how-it-works">
          <div className="section-copy">
            <span className="eyebrow"><Target size={16} /> Cara kerja SmartFinance AI</span>
            <h2>Dari catatan harian menjadi keputusan finansial yang lebih terarah.</h2>
            <p>
              SmartFinance AI mengubah transaksi yang kamu catat menjadi ringkasan cashflow,
              analisis kategori, dan rekomendasi yang membantu kamu mengontrol keuangan setiap bulan.
            </p>
          </div>

          <div className="workflow-card parallax-card">
            {workflow.map(([number, text]) => (
              <div key={number}>
                <b>{number}</b>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-bottom scroll-reveal" id="security">
          <article className="bottom-card dark-card">
            <LockKeyhole size={28} />
            <h2>Data keuangan lebih rapi, jelas, dan terkontrol.</h2>
            <p>
              Setiap transaksi ditampilkan dalam ringkasan yang mudah dipahami, sehingga kamu bisa memantau kondisi finansial tanpa membaca angka yang membingungkan.
            </p>
          </article>

          <article className="bottom-card light-card">
            <div className="stack-icons">
              <LineChart /><PieChart /><TrendingDown /><ShieldCheck />
            </div>
            <h2>Dirancang cepat, modern, dan nyaman digunakan.</h2>
            <p>
              Tampilan responsif, visual yang bersih, dan interaksi yang halus membuat proses mengelola
              keuangan terasa lebih sederhana di berbagai perangkat.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
