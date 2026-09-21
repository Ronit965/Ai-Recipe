import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

const API_URL = import.meta.env.VITE_API_URL || 'https://ai-recipe-2wpn.vercel.app'
const API_BASE = `${API_URL.replace(/\/+$/, '')}/api/auth`

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('recipeai_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })
  const [authLoading, setAuthLoading] = useState(true) // true while restoring session
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState('login')    // 'login' | 'signup'

  // ── Restore session from backend on page load ──────────────────────────────
  useEffect(() => {
    // Check if returning from GitHub OAuth redirect
    const params = new URLSearchParams(window.location.search)
    const githubCode = params.get('code')
    if (githubCode) {
      window.history.replaceState({}, document.title, window.location.pathname)
      const githubUser = {
        id: `github-${Date.now()}`,
        name: 'GitHub User',
        email: 'github.user@recipeai.app',
        provider: 'GitHub',
      }
      setUser(githubUser)
      localStorage.setItem('recipeai_user', JSON.stringify(githubUser))
      setAuthLoading(false)
      return
    }

    const restoreSession = async () => {
      try {
        const res = await fetch(`${API_BASE}/me/`, {
          credentials: 'include',
        })
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setUser(data.user)
            localStorage.setItem('recipeai_user', JSON.stringify(data.user))
          }
        }
      } catch {
        // Backend offline — keep local user if present
      } finally {
        setAuthLoading(false)
      }
    }
    restoreSession()
  }, [])

  const openLogin  = () => { setModalTab('login');  setModalOpen(true) }
  const openSignup = () => { setModalTab('signup'); setModalOpen(true) }
  const closeModal = () => setModalOpen(false)

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    try {
      const res = await fetch(`${API_BASE}/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw data.errors || { general: data.message || 'Registration failed. Please try again.' }
      }
      setUser(data.user)
      localStorage.setItem('recipeai_user', JSON.stringify(data.user))
      return data.user
    } catch (err) {
      if (err && typeof err === 'object' && !err.message) {
        throw err
      }
      // If network / server error, support local account creation
      const localUser = {
        id: 'user-' + Date.now(),
        name: name.trim() || 'Chef User',
        email: email.trim().toLowerCase(),
      }
      setUser(localUser)
      localStorage.setItem('recipeai_user', JSON.stringify(localUser))
      return localUser
    }
  }, [])

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw data.errors || { general: data.message || 'Invalid email or password.' }
      }
      setUser(data.user)
      localStorage.setItem('recipeai_user', JSON.stringify(data.user))
      return data.user
    } catch (err) {
      if (err && typeof err === 'object' && !err.message) {
        throw err
      }
      // If network / server error, fallback to local login
      const cleanEmail = email.trim().toLowerCase()
      const namePart = cleanEmail.split('@')[0] || 'Chef'
      const formattedName = namePart.replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      const localUser = {
        id: 'user-' + Date.now(),
        name: formattedName,
        email: cleanEmail,
      }
      setUser(localUser)
      localStorage.setItem('recipeai_user', JSON.stringify(localUser))
      return localUser
    }
  }, [])

  // ── Google OAuth Login ─────────────────────────────────────────────────────
  const googleLogin = useCallback(() => {
    return new Promise((resolve, reject) => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

      // Helper to process authenticated Google profile
      const handleGoogleProfile = async (profile) => {
        try {
          const res = await fetch(`${API_BASE}/google/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              email: profile.email,
              name: profile.name || profile.given_name || 'Google User',
              avatar: profile.picture || '',
              google_id: profile.sub || profile.id || '',
            }),
          })

          let userObj
          if (res.ok) {
            const data = await res.json()
            userObj = data.user
          } else {
            userObj = {
              id: profile.sub || `google-${Date.now()}`,
              name: profile.name || profile.given_name || 'Google User',
              email: profile.email,
              avatar: profile.picture || '',
            }
          }

          setUser(userObj)
          localStorage.setItem('recipeai_user', JSON.stringify(userObj))
          resolve(userObj)
        } catch (err) {
          // If backend offline, persist local session with real Google profile info
          const userObj = {
            id: profile.sub || `google-${Date.now()}`,
            name: profile.name || profile.given_name || 'Google User',
            email: profile.email,
            avatar: profile.picture || '',
          }
          setUser(userObj)
          localStorage.setItem('recipeai_user', JSON.stringify(userObj))
          resolve(userObj)
        }
      }

      // 1. Check if Google Identity Services (GSI) and Client ID are ready
      if (!clientId) {
        reject(new Error('Google sign-in is not configured yet.'))
        return
      }

      if (!window.google?.accounts?.oauth2) {
        reject(new Error('Google services are still loading. Please wait a moment and try again.'))
        return
      }

      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'openid email profile',
          prompt: 'select_account', // Forces Google to show all Google accounts on the device/browser
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              reject(new Error(tokenResponse.error_description || tokenResponse.error))
              return
            }
            try {
              // Fetch real user profile from Google
              const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              })
              const profile = await userRes.json()
              await handleGoogleProfile(profile)
            } catch (fetchErr) {
              reject(fetchErr)
            }
          },
          error_callback: (err) => {
            reject(err)
          },
        })

        // Request token with account selection prompt
        client.requestAccessToken({ prompt: 'select_account' })
      } catch (e) {
        console.error('Google Identity Services error:', e)
        reject(new Error('Failed to open Google account chooser. Please check browser pop-up permissions.'))
      }
    })
  }, [])

  // ── GitHub OAuth Login ─────────────────────────────────────────────────────
  const githubLogin = useCallback(() => {
    return new Promise((resolve, reject) => {
      const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID
      if (!clientId) {
        reject(new Error('GitHub sign-in is not configured yet. Please configure VITE_GITHUB_CLIENT_ID in your .env file.'))
        return
      }

      // Open GitHub OAuth authorize (GitHub will use the callback URL configured in your GitHub Developer Settings)
      const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user%20user:email`
      window.location.href = authUrl
    })
  }, [])

  // ── Social Login ───────────────────────────────────────────────────────────
  const socialLogin = useCallback(async (provider = 'Google') => {
    if (provider === 'Google') {
      return googleLogin()
    }
    if (provider === 'GitHub') {
      return githubLogin()
    }

    // Generic social login
    const socialUser = {
      id: `social-${provider.toLowerCase()}-${Date.now()}`,
      name: `${provider} Chef`,
      email: `chef@${provider.toLowerCase()}.com`,
      provider: provider,
    }
    setUser(socialUser)
    localStorage.setItem('recipeai_user', JSON.stringify(socialUser))
    return socialUser
  }, [googleLogin, githubLogin])

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/logout/`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // Ignore network errors
    }
    setUser(null)
    localStorage.removeItem('recipeai_user')
  }, [])

  // ── Subscription Management ─────────────────────────────────────────────
  const subscribePlan = useCallback((planDetails) => {
    // planDetails: { planId: 'monthly'|'yearly'|'lifetime', name: string, price: string, billingPeriod: string, activatedAt: string }
    const now = new Date()
    let expiresAt = null

    if (planDetails.planId === 'monthly') {
      const d = new Date()
      d.setMonth(d.getMonth() + 1)
      expiresAt = d.toISOString()
    } else if (planDetails.planId === 'yearly') {
      const d = new Date()
      d.setFullYear(d.getFullYear() + 1)
      expiresAt = d.toISOString()
    } else if (planDetails.planId === 'lifetime') {
      expiresAt = 'Lifetime'
    }

    const subscriptionData = {
      planId: planDetails.planId,
      name: planDetails.name,
      price: planDetails.price,
      currency: planDetails.currency || 'USD',
      status: 'active',
      startedAt: now.toISOString(),
      expiresAt: expiresAt,
      isLifetime: planDetails.planId === 'lifetime',
    }

    setUser(prev => {
      const updated = prev
        ? { ...prev, subscription: subscriptionData }
        : {
            id: 'user-' + Date.now(),
            name: 'Pro Chef',
            email: 'chef@recipeai.app',
            subscription: subscriptionData,
          }
      localStorage.setItem('recipeai_user', JSON.stringify(updated))
      return updated
    })

    return subscriptionData
  }, [])

  const cancelSubscription = useCallback(() => {
    setUser(prev => {
      if (!prev) return null
      const updated = {
        ...prev,
        subscription: {
          ...prev.subscription,
          status: 'cancelled',
          cancelledAt: new Date().toISOString(),
        }
      }
      localStorage.setItem('recipeai_user', JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      authLoading,
      modalOpen,
      modalTab,
      setModalTab,
      openLogin,
      openSignup,
      closeModal,
      login,
      logout,
      register,
      socialLogin,
      subscribePlan,
      cancelSubscription,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

