import { useEffect, useRef } from 'react'

/* ── Scroll-reveal via IntersectionObserver ── */
export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.revealDelay || '0'
            entry.target.style.animationDelay = `${delay}ms`
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.05, rootMargin: '0px 0px 50px 0px' }
    )

    const observeElements = () => {
      const els = document.querySelectorAll('[data-reveal]:not(.revealed)')
      els.forEach((el) => {
        const rect = el.getBoundingClientRect()
        // If already in viewport on load, reveal immediately
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const delay = el.dataset.revealDelay || '0'
          el.style.animationDelay = `${delay}ms`
          el.classList.add('revealed')
        } else {
          observer.observe(el)
        }
      })
    }

    observeElements()

    // MutationObserver to catch dynamically added items
    const mutationObserver = new MutationObserver(() => {
      observeElements()
    })

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [])
}

/* ── Animated counter ── */
export function useCountUp(ref, end, duration = 1800) {
  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const isPercent = String(end).includes('%')
    const isPlus = String(end).includes('+')
    const raw = parseFloat(end)
    let start = null

    const step = (ts) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.floor(eased * raw)
      el.textContent =
        current + (isPlus ? '+' : '') + (isPercent ? '%' : '')
      if (progress < 1) requestAnimationFrame(step)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          requestAnimationFrame(step)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [end, duration, ref])
}

/* ── Particle canvas background ── */
export function useParticles(canvasRef, theme) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let W = (canvas.width = canvas.offsetWidth)
    let H = (canvas.height = canvas.offsetHeight)

    const isDark = theme === 'dark'
    const color = isDark ? '0,203,163' : '0,133,106'

    const PARTICLE_COUNT = Math.min(55, Math.floor((W * H) / 18000))
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 2.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(${color},${0.08 * (1 - dist / 120)})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      // Draw dots
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > W) p.vx *= -1
        if (p.y < 0 || p.y > H) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color},${p.alpha})`
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    draw()

    const resize = () => {
      W = canvas.width = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [canvasRef, theme])
}

/* ── Magnetic button effect ── */
export function useMagneticButtons() {
  useEffect(() => {
    const btns = document.querySelectorAll('.btn-primary, .btn-accent')

    const handleMove = (e) => {
      const btn = e.currentTarget
      const rect = btn.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`
    }
    const handleLeave = (e) => {
      e.currentTarget.style.transform = ''
    }

    btns.forEach((btn) => {
      btn.addEventListener('mousemove', handleMove)
      btn.addEventListener('mouseleave', handleLeave)
    })

    return () => {
      btns.forEach((btn) => {
        btn.removeEventListener('mousemove', handleMove)
        btn.removeEventListener('mouseleave', handleLeave)
      })
    }
  }, [])
}

/* ── Typewriter effect ── */
export function useTypewriter(ref, words, speed = 110, pause = 1800) {
  const idx = useRef(0)
  const charIdx = useRef(0)
  const deleting = useRef(false)
  const timer = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current

    const tick = () => {
      const word = words[idx.current]
      if (deleting.current) {
        charIdx.current--
        el.textContent = word.slice(0, charIdx.current)
        if (charIdx.current === 0) {
          deleting.current = false
          idx.current = (idx.current + 1) % words.length
          timer.current = setTimeout(tick, 400)
          return
        }
        timer.current = setTimeout(tick, speed / 2)
      } else {
        charIdx.current++
        el.textContent = word.slice(0, charIdx.current)
        if (charIdx.current === word.length) {
          deleting.current = true
          timer.current = setTimeout(tick, pause)
          return
        }
        timer.current = setTimeout(tick, speed)
      }
    }

    timer.current = setTimeout(tick, 500)
    return () => clearTimeout(timer.current)
  }, [words, speed, pause, ref])
}
