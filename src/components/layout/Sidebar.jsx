import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, ReceiptText, Sparkles, User, WalletCards } from 'lucide-react'
import { authRepository } from '../../lib/repositories/authRepository'

const links = [
  ['/dashboard', LayoutDashboard, 'Dashboard'],
  ['/transactions', ReceiptText, 'Transaksi'],
  ['/recommendations', Sparkles, 'Rekomendasi'],
  ['/profile', User, 'Profil'],
]

export default function Sidebar() {
  const navigate = useNavigate()

  async function logout() {
    await authRepository.logout()
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><WalletCards size={24} /></div>
        <div><b>SmartFinance</b><span>Asisten uang pribadi</span></div>
      </div>
      <nav>{links.map(([to, Icon, label]) => <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={19} /><span>{label}</span></NavLink>)}</nav>
      <button className="nav-link logout-link" type="button" onClick={logout}><LogOut size={19} /><span>Keluar</span></button>
    </aside>
  )
}
