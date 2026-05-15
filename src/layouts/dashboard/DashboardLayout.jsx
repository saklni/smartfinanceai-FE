import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
export default function DashboardLayout({ theme, onToggleTheme }){return <div className="app-shell"><Sidebar/><main className="content"><Topbar theme={theme} onToggleTheme={onToggleTheme}/><Outlet/></main></div>}
