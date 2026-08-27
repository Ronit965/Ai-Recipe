import { useState, useEffect, useRef } from 'react'
import { FiX, FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiCheck, FiArrowRight } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import './AuthModal.css'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
      <path d="M6.3 14.7l7 5.1C15.1 16.3 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z" fill="#FF3D00"/>
      <path d="M24 46c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.5C29.7 36.9 27 38 24 38c-6.1 0-11.3-4.1-13.1-9.7l-7 5.4C7.9 41.5 15.4 46 24 46z" fill="#4CAF50"/>
      <path d="M44.5 20H24v8.5h11.8c-.9 2.9-2.9 5.3-5.5 6.9l6.6 5.5C40.7 37.5 45 31.4 45 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.58 2 12.24c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.1-1.49-1.1-1.49-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0 1 12 6.84c.85 0 1.7.12 2.5.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49C19.14 20.6 22 16.77 22 12.24 22 6.58 17.52 2 12 2z"/>
    </svg>
  )
}

export default function AuthModal() {
  const { modalOpen, modalTab, setModalTab, closeModal, login, register, socialLogin } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const backdropRef = useRef(null)

  // Reset on tab/open change
  useEffect(() => {
    setForm({ name: '', email: '', password: '', confirm: '' })
    setErrors({})
    setSuccess(false)
    setLoading(false)
    setShowPwd(false)
    setForgotMode(false)
    setForgotSent(false)
  }, [modalTab, modalOpen])

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeModal() }
    if (modalOpen) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [modalOpen, closeModal])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [modalOpen])

  if (!modalOpen) return null

  const isLogin = modalTab === 'login'

  // ── Client-side validation ─────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!isLogin && !form.name.trim()) e.name = 'Full name is required'
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Enter a valid email address'
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters'
    if (!isLogin && form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setErrors({})

    try {
      if (isLogin) {
        await login(form.email, form.password)
      } else {
        await register(form.name, form.email, form.password)
      }
      setSuccess(true)
      setTimeout(() => {
        closeModal()
      }, 700)
    } catch (apiErrors) {
      if (typeof apiErrors === 'object' && apiErrors !== null) {
        setErrors(apiErrors)
      } else if (typeof apiErrors === 'string') {
        setErrors({ general: apiErrors })
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Social Login ───────────────────────────────────────────────────────────
  const handleSocial = async (provider) => {
    setLoading(true)
    setErrors({})
    try {
      await socialLogin(provider)
      setSuccess(true)
      setTimeout(() => {
        closeModal()
      }, 700)
    } catch (err) {
      const msg = (err && (typeof err === 'string' ? err : err.message)) || `Failed to continue with ${provider}.`
      setErrors({ general: msg })
    } finally {
      setLoading(false)
    }
  }

  // ── Forgot Password Submit ─────────────────────────────────────────────────
  const handleForgotSubmit = (e) => {
    e.preventDefault()
    if (!forgotEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setErrors({ forgot: 'Please enter a valid email address.' })
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setForgotSent(true)
    }, 600)
  }

  const setField = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }))
    if (errors.general) setErrors(e => ({ ...e, general: undefined }))
  }

  return (
    <div className="auth-backdrop" ref={backdropRef} onClick={e => e.target === backdropRef.current && closeModal()}>
      <div className={`auth-modal ${success ? 'auth-modal--success' : ''}`}>

        {/* Decorative blobs */}
        <div className="auth-modal__blob auth-modal__blob--teal" />
        <div className="auth-modal__blob auth-modal__blob--purple" />

        {/* Close */}
        <button className="auth-modal__close" onClick={closeModal} aria-label="Close">
          <FiX size={18} />
        </button>

        {/* Success state */}
        {success ? (
          <div className="auth-success">
            <div className="auth-success__icon">
              <FiCheck size={36} />
            </div>
            <h2>{isLogin ? 'Welcome back! 👋' : 'Account created! 🎉'}</h2>
            <p>{isLogin ? "You're now signed in." : 'Welcome to RecipeAI!'}</p>
          </div>
        ) : forgotMode ? (
          /* Forgot Password Mode */
          <div className="auth-modal__body">
            <div className="auth-modal__header">
              <div className="auth-modal__logo">🔑</div>
              <h2 className="auth-modal__title">Reset Password</h2>
              <p className="auth-modal__subtitle">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
            </div>

            {forgotSent ? (
              <div className="auth-success" style={{ padding: '20px 0' }}>
                <div className="auth-success__icon" style={{ background: 'rgba(0,203,163,0.15)', color: 'var(--secondary)' }}>
                  <FiCheck size={30} />
                </div>
                <h3>Reset Link Sent!</h3>
                <p>We've sent a password reset link to <strong>{forgotEmail}</strong>.</p>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: 20 }}
                  onClick={() => { setForgotMode(false); setForgotSent(false); setModalTab('login') }}
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form className="auth-form" onSubmit={handleForgotSubmit}>
                {errors.forgot && <div className="auth-error-banner">{errors.forgot}</div>}
                <div className="auth-field">
                  <label>Email Address</label>
                  <div className="auth-input-wrap">
                    <FiMail size={16} className="auth-input-icon" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={forgotEmail}
                      onChange={e => { setForgotEmail(e.target.value); setErrors({}) }}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={`auth-submit-btn ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  {loading ? <span className="auth-spinner" /> : 'Send Reset Link'}
                </button>

                <p className="auth-switch" style={{ marginTop: 14 }}>
                  <button type="button" onClick={() => setForgotMode(false)}>
                    ← Back to Log In
                  </button>
                </p>
              </form>
            )}
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="auth-modal__header">
              <div className="auth-modal__logo">🍽️</div>
              <h2 className="auth-modal__title">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="auth-modal__subtitle">
                {isLogin
                  ? 'Sign in to access your saved recipes and preferences.'
                  : 'Join thousands of cooks using RecipeAI every day.'}
              </p>
            </div>

            {/* Tab toggle */}
            <div className="auth-tabs">
              <button
                className={`auth-tab ${isLogin ? 'active' : ''}`}
                onClick={() => { setModalTab('login'); setErrors({}) }}
              >
                Log In
              </button>
              <button
                className={`auth-tab ${!isLogin ? 'active' : ''}`}
                onClick={() => { setModalTab('signup'); setErrors({}) }}
              >
                Sign Up
              </button>
            </div>

            {/* Social Buttons */}
            <div className="auth-social">
              <button
                type="button"
                className="auth-social-btn"
                id="google-auth-btn"
                onClick={() => handleSocial('Google')}
              >
                <GoogleIcon /> Continue with Google
              </button>
              <button
                type="button"
                className="auth-social-btn"
                id="github-auth-btn"
                onClick={() => handleSocial('GitHub')}
              >
                <GithubIcon /> Continue with GitHub
              </button>
            </div>

            <div className="auth-divider"><span>or continue with email</span></div>

            {/* General API error banner */}
            {errors.general && (
              <div className="auth-error-banner">
                {errors.general}
              </div>
            )}

            {/* Form */}
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {!isLogin && (
                <div className={`auth-field ${errors.name ? 'has-error' : ''}`}>
                  <label>Full Name</label>
                  <div className="auth-input-wrap">
                    <FiUser size={16} className="auth-input-icon" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={e => setField('name', e.target.value)}
                      autoComplete="name"
                      id="signup-name"
                    />
                  </div>
                  {errors.name && <span className="auth-error">{errors.name}</span>}
                </div>
              )}

              <div className={`auth-field ${errors.email ? 'has-error' : ''}`}>
                <label>Email Address</label>
                <div className="auth-input-wrap">
                  <FiMail size={16} className="auth-input-icon" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setField('email', e.target.value)}
                    autoComplete="email"
                    id={isLogin ? 'login-email' : 'signup-email'}
                  />
                </div>
                {errors.email && <span className="auth-error">{errors.email}</span>}
              </div>

              <div className={`auth-field ${errors.password ? 'has-error' : ''}`}>
                <label>Password</label>
                <div className="auth-input-wrap">
                  <FiLock size={16} className="auth-input-icon" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder={isLogin ? '••••••••' : 'Min 6 characters'}
                    value={form.password}
                    onChange={e => setField('password', e.target.value)}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    id={isLogin ? 'login-password' : 'signup-password'}
                  />
                  <button type="button" className="auth-eye-btn" onClick={() => setShowPwd(v => !v)}>
                    {showPwd ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
                {errors.password && <span className="auth-error">{errors.password}</span>}
              </div>

              {!isLogin && (
                <div className={`auth-field ${errors.confirm ? 'has-error' : ''}`}>
                  <label>Confirm Password</label>
                  <div className="auth-input-wrap">
                    <FiLock size={16} className="auth-input-icon" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      placeholder="Repeat password"
                      value={form.confirm}
                      onChange={e => setField('confirm', e.target.value)}
                      autoComplete="new-password"
                      id="signup-confirm"
                    />
                  </div>
                  {errors.confirm && <span className="auth-error">{errors.confirm}</span>}
                </div>
              )}

              {isLogin && (
                <div className="auth-forgot">
                  <button
                    type="button"
                    className="auth-forgot-btn"
                    onClick={() => { setForgotMode(true); setForgotEmail(form.email) }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                className={`auth-submit-btn ${loading ? 'loading' : ''}`}
                disabled={loading}
                id={isLogin ? 'login-submit-btn' : 'signup-submit-btn'}
              >
                {loading
                  ? <span className="auth-spinner" />
                  : <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <FiArrowRight size={17} />
                    </>
                }
              </button>
            </form>

            <p className="auth-switch">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => { setModalTab(isLogin ? 'signup' : 'login'); setErrors({}) }}>
                {isLogin ? 'Sign up free' : 'Log in'}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
