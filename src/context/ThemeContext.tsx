import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Theme {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    border: string
    success: string
    error: string
    warning: string
    info: string
    cardBg: string
    headerBg: string
    sidebarBg: string
    gradient: string
    bgPanel: string
  }
}

export const themes: Record<string, Theme> = {
  dark: {
    name: 'Dark',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#f093fb',
      background: '#0f0f23',
      surface: '#1a1a2e',
      text: '#ffffff',
      textSecondary: '#9ca3af',
      border: '#2d3748',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      cardBg: '#16213e',
      headerBg: '#1a1a2e',
      sidebarBg: '#16213e',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      bgPanel: '#262B3E',
    },
  },
  blue: {
    name: 'Ocean Blue',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      accent: '#38bdf8',
      background: '#0c1222',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#0ea5e9',
      cardBg: '#1e293b',
      headerBg: '#0f172a',
      sidebarBg: '#1e293b',
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
      bgPanel: '#2a3a50',
    },
  },
  green: {
    name: 'Forest Green',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#34d399',
      background: '#0a1810',
      surface: '#1a2f23',
      text: '#f0fdf4',
      textSecondary: '#86efac',
      border: '#2d4a3a',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      cardBg: '#1a2f23',
      headerBg: '#0f1f17',
      sidebarBg: '#1a2f23',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      bgPanel: '#243d2d',
    },
  },
  purple: {
    name: 'Royal Purple',
    colors: {
      primary: '#a855f7',
      secondary: '#9333ea',
      accent: '#c084fc',
      background: '#1a0b2e',
      surface: '#2d1b4e',
      text: '#faf5ff',
      textSecondary: '#d8b4fe',
      border: '#4c2a85',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#a855f7',
      cardBg: '#2d1b4e',
      headerBg: '#1e0f3a',
      sidebarBg: '#2d1b4e',
      gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
      bgPanel: '#3d2568',
    },
  },
  orange: {
    name: 'Sunset Orange',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#fb923c',
      background: '#1a0f0a',
      surface: '#2d1810',
      text: '#fff7ed',
      textSecondary: '#fdba74',
      border: '#4a2410',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f97316',
      info: '#3b82f6',
      cardBg: '#2d1810',
      headerBg: '#1f0e08',
      sidebarBg: '#2d1810',
      gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      bgPanel: '#3d2213',
    },
  },
  light: {
    name: 'Light',
    colors: {
      primary: '#1976d2',
      secondary: '#1565c0',
      accent: '#42a5f5',
      background: '#f0f2f5',
      surface: '#f8fafc',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      success: '#16a34a',
      error: '#dc2626',
      warning: '#d97706',
      info: '#2563eb',
      cardBg: '#ffffff',
      headerBg: '#1976d2',
      sidebarBg: '#ffffff',
      gradient: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
      bgPanel: '#f3f4f6',
    },
  },
}

interface ThemeContextType {
  currentTheme: Theme
  themeName: string
  setTheme: (themeName: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeName, setThemeName] = useState<string>(() => {
    return localStorage.getItem('app-theme') || 'light'
  })

  const currentTheme = themes[themeName] || themes.dark

  const setTheme = (name: string) => {
    setThemeName(name)
    localStorage.setItem('app-theme', name)
    document.documentElement.setAttribute('data-theme', name)
  }

  useEffect(() => {
    const root = document.documentElement
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })
    root.style.setProperty('--bg-panel', currentTheme.colors.bgPanel)
    root.setAttribute('data-theme', themeName)
  }, [currentTheme, themeName])

  return (
    <ThemeContext.Provider value={{ currentTheme, themeName, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
