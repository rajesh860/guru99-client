import { useState } from 'react'
import { useTheme, themes } from '../../context/ThemeContext'
import './ThemeSwitcher.scss'
import { FaPalette } from 'react-icons/fa'

const ThemeSwitcher = () => {
  const { themeName, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="theme-switcher">
      <button 
        className="theme-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change theme"
      >
        <FaPalette />
      </button>

      {isOpen && (
        <>
          <div 
            className="theme-overlay" 
            onClick={() => setIsOpen(false)}
          />
          <div className="theme-dropdown">
            <h3>Choose Theme</h3>
            <div className="theme-grid">
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  className={`theme-option ${themeName === key ? 'active' : ''}`}
                  onClick={() => {
                    setTheme(key)
                    setIsOpen(false)
                  }}
                >
                  <div 
                    className="theme-preview"
                    style={{
                      background: theme.colors.gradient,
                    }}
                  >
                    <div className="preview-colors">
                      <span style={{ background: theme.colors.primary }}></span>
                      <span style={{ background: theme.colors.secondary }}></span>
                      <span style={{ background: theme.colors.accent }}></span>
                    </div>
                  </div>
                  <span className="theme-name">{theme.name}</span>
                  {themeName === key && (
                    <span className="check-icon">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ThemeSwitcher
