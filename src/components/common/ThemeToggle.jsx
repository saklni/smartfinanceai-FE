import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ theme, onToggle, compact = false }) {
  return (
    <button
      type="button"
      className={`theme-toggle ${compact ? 'compact' : ''}`}
      onClick={onToggle}
      aria-label="Toggle dark mode"
    >
      <span className="toggle-thumb">{theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}</span>
      {!compact && <b>{theme === 'dark' ? 'Dark' : 'Light'}</b>}
    </button>
  );
}
