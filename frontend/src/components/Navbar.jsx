import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { FiMenu, FiX, FiBookmark, FiSun, FiMoon, FiLogOut, FiSettings, FiZap, FiAward } from 'react-icons/fi'
import { useRecipe } from '../context/RecipeContext'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [spinning, setSpinning]     = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { savedRecipes }            = useRecipe()
  const { theme, toggleTheme }      = useTheme()
  const { user, openLogin, openSignup, logout } = useAuth()
  const location                    = useLocation()
  const userMenuRef                 = useRef(null)

  const isPro = user?.subscription?.status === 'active'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location])

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleThemeToggle = () => {
    setSpinning(true)
    toggleTheme()
    setTimeout(() => setSpinning(false), 450)
  }

  const isDark = theme === 'dark'

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-icon">🍽️</span>
          <span className="navbar__logo-text">Recipe<span>AI</span></span>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar__links">
          <NavLink to="/" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`} end>
            Home
          </NavLink>
          <NavLink to="/generator" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>
            Generator
          </NavLink>
          <NavLink to="/saved" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>
            Saved
            {savedRecipes.length > 0 && (
              <span className="navbar__badge">{savedRecipes.length}</span>
            )}
          </NavLink>
          <NavLink to="/pricing" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>
            Pricing
            <span className="navbar__pro-pill">PRO</span>
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `navbar__link ${isActive ? 'active' : ''}`}>
            About
          </NavLink>
        </nav>

        {/* Actions */}
        <div className="navbar__actions">
          {/* Theme Toggle */}
          <button
            className={`theme-toggle ${spinning ? 'theme-toggle--spinning' : ''}`}
            onClick={handleThemeToggle}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            id="theme-toggle-btn"
          >
            <span className="theme-toggle__icon">
              {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
            </span>
            <span className="theme-toggle__label">
              {isDark ? 'Light' : 'Dark'}
            </span>
          </button>

          {/* Auth buttons / User avatar */}
          {user ? (
            /* Logged-in: avatar + dropdown */
            <div className="navbar__user" ref={userMenuRef}>
              <button
                className={`navbar__avatar-btn ${isPro ? 'navbar__avatar-btn--pro' : ''}`}
                onClick={() => setUserMenuOpen(o => !o)}
                aria-label="User menu"
                id="user-menu-btn"
              >
                <span className="navbar__avatar">{user.name?.[0]?.toUpperCase() || '👤'}</span>
                <span className="navbar__user-name">{user.name}</span>
                {isPro && <span className="navbar__user-pro-tag">PRO</span>}
                <span className={`navbar__avatar-chevron ${userMenuOpen ? 'open' : ''}`}>▾</span>
              </button>

              {userMenuOpen && (
                <div className="navbar__user-menu">
                  <div className="navbar__user-menu-header">
                    <div className="navbar__user-menu-avatar">{user.name?.[0]?.toUpperCase()}</div>
                    <div className="navbar__user-menu-details">
                      <div className="navbar__user-menu-name">{user.name}</div>
                      <div className="navbar__user-menu-email">{user.email}</div>
                    </div>
                  </div>

                  {/* Active plan status in dropdown */}
                  <div className="navbar__user-plan-badge">
                    {isPro ? (
                      <div className="user-plan-active">
                        <FiAward size={14} className="user-plan-icon" />
                        <span className="user-plan-active__text">{user.subscription.name}</span>
                      </div>
                    ) : (
                      <Link to="/pricing" className="user-plan-upgrade" onClick={() => setUserMenuOpen(false)}>
                        <div className="user-plan-upgrade__left">
                          <span className="user-plan-upgrade__status">Free Plan</span>
                        </div>
                        <span className="user-plan-upgrade__btn">
                          <FiZap size={12} /> Upgrade to Pro
                        </span>
                      </Link>
                    )}
                  </div>

                  <div className="navbar__user-menu-divider" />
                  <Link to="/saved" className="navbar__user-menu-item" onClick={() => setUserMenuOpen(false)}>
                    <FiBookmark size={15} /> My Saved Recipes
                  </Link>
                  <Link to="/pricing" className="navbar__user-menu-item" onClick={() => setUserMenuOpen(false)}>
                    <FiZap size={15} /> Subscription & Plans
                  </Link>
                  <button className="navbar__user-menu-item">
                    <FiSettings size={15} /> Settings
                  </button>
                  <div className="navbar__user-menu-divider" />
                  <button
                    className="navbar__user-menu-item navbar__user-menu-item--logout"
                    onClick={() => { logout(); setUserMenuOpen(false) }}
                    id="logout-btn"
                  >
                    <FiLogOut size={15} /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Logged-out: Login + Signup buttons */
            <div className="navbar__auth-btns">
              <button
                className="btn-login"
                onClick={openLogin}
                id="navbar-login-btn"
              >
                Log In
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={openSignup}
                id="navbar-signup-btn"
              >
                Sign Up Free
              </button>
            </div>
          )}

          <button
            className="navbar__mobile-toggle"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="navbar__mobile-menu">
          <NavLink to="/" className="navbar__mobile-link" end>Home</NavLink>
          <NavLink to="/generator" className="navbar__mobile-link">Generator</NavLink>
          <NavLink to="/saved" className="navbar__mobile-link">
            <FiBookmark size={16} /> Saved ({savedRecipes.length})
          </NavLink>
          <NavLink to="/pricing" className="navbar__mobile-link">
            <FiZap size={16} /> Pricing & Plans
          </NavLink>
          <NavLink to="/about" className="navbar__mobile-link">About</NavLink>

          <div className="navbar__mobile-auth">
            {user ? (
              <div className="navbar__mobile-user">
                <div className="navbar__mobile-user-info">
                  <span className="navbar__avatar">{user.name?.[0]?.toUpperCase()}</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>{user.name}</span>
                    {isPro && <span style={{ fontSize: 11, color: 'var(--secondary)', fontWeight: 700 }}>PRO ACTIVE</span>}
                  </div>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => { logout(); setMobileOpen(false) }}
                >
                  <FiLogOut size={14} /> Log Out
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="theme-toggle"
                  onClick={handleThemeToggle}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <span className="theme-toggle__icon">
                    {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
                  </span>
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button
                  className="btn-login"
                  onClick={() => { openLogin(); setMobileOpen(false) }}
                  style={{ flex: 1 }}
                >
                  Log In
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => { openSignup(); setMobileOpen(false) }}
                  style={{ flex: 1 }}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
