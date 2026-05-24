import { Bell, Search } from 'lucide-react'
import ThemeToggle from '../common/ThemeToggle'
import { useUser } from '../../lib/utils/UserContext'

export default function Topbar({ theme, onToggleTheme }) {
  const { user } = useUser()

  return (
    <header className="topbar">
      <div className="search"><Search size={18} /><input placeholder="Cari transaksi, kategori, insight..." /></div>
      <div className="top-actions">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} compact />
        <button className="icon-btn pulse-click"><Bell size={19} /></button>
        <div className="avatar">{user?.avatar || user?.name?.slice(0, 2) || 'SF'}</div>
      </div>
    </header>
  )
}
