import { useNavigate } from "react-router-dom"
import { useTheme, themes } from "../../context/ThemeContext"
import "./theme-select.scss"

const ThemeSelect = () => {
  const navigate = useNavigate()
  const { themeName, setTheme } = useTheme()

  const handleSelect = (themeId: string) => {
    setTheme(themeId)
    navigate("/tc")
  }

  return (
    <div className="ts-page">
      <div className="ts-heading">
        <h1>Choose Your Theme</h1>
        <p>Select a theme to personalise your experience</p>
      </div>

      <div className="theme-grid">
        {Object.entries(themes).map(([key, theme]) => (
          <button
            key={key}
            className={`theme-option ${themeName === key ? "active" : ""}`}
            onClick={() => handleSelect(key)}
          >
            <div
              className="theme-preview"
              style={{ background: theme.colors.gradient }}
            >
              <div className="preview-colors">
                <span style={{ background: theme.colors.primary }} />
                <span style={{ background: theme.colors.secondary }} />
                <span style={{ background: theme.colors.accent }} />
              </div>
            </div>
            <span className="theme-name">{theme.name}</span>
            {themeName === key && <span className="check-icon">✓</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ThemeSelect
