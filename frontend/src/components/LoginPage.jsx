import { useState } from "react"

function LoginPage({ onLogin, onRegister }) {
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isRegister) {
        if (!formData.name.trim()) {
          setError("Nama wajib diisi")
          setLoading(false)
          return
        }
        if (formData.password.length < 8) {
          setError("Password minimal 8 karakter")
          setLoading(false)
          return
        }
        await onRegister(formData)
      } else {
        if (!formData.email.trim()) {
          setError("Username / Email wajib diisi")
          setLoading(false)
          return
        }
        await onLogin(formData.email, formData.password)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      {/* LEFT SIDE — Purple branding panel */}
      <div style={styles.leftPanel}>
        <div style={styles.brandContent}>
          <h1 style={styles.brandTitle}>sowel{"\n"}task</h1>
          <p style={styles.brandTagline}>
            Stay on track, every day with everyone.
          </p>
        </div>
        {/* Decorative illustration elements */}
        <div style={styles.illustrationArea}>
          {/* Clock */}
          <div style={styles.clockCircle}>
            <svg viewBox="0 0 80 80" width="80" height="80">
              <circle cx="40" cy="40" r="36" fill="white" stroke="#e0e0e0" strokeWidth="2"/>
              <circle cx="40" cy="40" r="2" fill="#333"/>
              <line x1="40" y1="40" x2="40" y2="18" stroke="#333" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="40" y1="40" x2="56" y2="40" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
              {[...Array(12)].map((_, i) => {
                const angle = (i * 30 - 90) * Math.PI / 180
                const x1 = 40 + 30 * Math.cos(angle)
                const y1 = 40 + 30 * Math.sin(angle)
                const x2 = 40 + 34 * Math.cos(angle)
                const y2 = 40 + 34 * Math.sin(angle)
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#999" strokeWidth="1.5"/>
              })}
            </svg>
          </div>

          {/* Sticky notes */}
          <div style={styles.stickyPink}></div>
          <div style={styles.stickyYellow}></div>

          {/* Checklist card */}
          <div style={styles.checklistCard}>
            <div style={styles.checklistLine}><span style={styles.checkboxDone}>✓</span> <span style={styles.lineText}></span></div>
            <div style={styles.checklistLine}><span style={styles.checkboxDone}>✓</span> <span style={styles.lineText}></span></div>
            <div style={styles.checklistLine}><span style={styles.checkboxEmpty}></span> <span style={styles.lineText}></span></div>
            <div style={styles.checklistLine}><span style={styles.checkboxEmpty}></span> <span style={styles.lineText}></span></div>
          </div>

          {/* Check mark circle */}
          <div style={styles.checkCircle}>
            <svg viewBox="0 0 60 60" width="60" height="60">
              <circle cx="30" cy="30" r="28" fill="#2ecc71"/>
              <polyline points="18,30 27,39 42,22" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Small decorative dots */}
          <div style={{...styles.dot, top: '30%', left: '10%', width: 8, height: 8, background: '#9b7fd4'}}></div>
          <div style={{...styles.dot, top: '20%', right: '20%', width: 6, height: 6, background: 'rgba(255,255,255,0.3)'}}></div>
          <div style={{...styles.dot, bottom: '25%', left: '5%', width: 10, height: 10, background: 'rgba(255,255,255,0.15)'}}></div>
        </div>
      </div>

      {/* RIGHT SIDE — Login form */}
      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          <h2 style={styles.welcomeTitle}>
            {isRegister ? "Create Account!" : "Welcome Back!"}
          </h2>
          <p style={styles.welcomeSubtitle}>
            Simplify your workflow and boost your productivity with{" "}
            <strong>Sowel Task.</strong> Get started for free.
          </p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {isRegister && (
              <div style={styles.fieldGroup}>
                <input
                  type="text"
                  name="name"
                  id="register-name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  style={styles.input}
                />
              </div>
            )}

            <div style={styles.fieldGroup}>
              <input
                type="text"
                name="email"
                id="login-username"
                value={formData.email}
                onChange={handleChange}
                placeholder="Username"
                style={styles.input}
                autoComplete="username"
              />
            </div>

            <div style={styles.fieldGroup}>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="login-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  style={{ ...styles.input, paddingRight: "2.5rem" }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>
              {!isRegister && (
                <div style={styles.forgotRow}>
                  <span style={styles.forgotLink}>Forgot Password?</span>
                </div>
              )}
            </div>

            {!isRegister && (
              <label style={styles.checkboxLabel} id="agree-terms-label">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  style={styles.checkbox}
                  id="agree-terms"
                />
                I agree to the{" "}
                <span style={styles.link}>terms of service</span> and{" "}
                <span style={styles.link}>privacy policy</span>
              </label>
            )}

            <button
              type="submit"
              style={{
                ...styles.btnSubmit,
                opacity: loading ? 0.7 : 1,
              }}
              disabled={loading}
              id="login-submit"
            >
              {loading
                ? "Loading..."
                : isRegister
                ? "Register"
                : "Login"}
            </button>
          </form>

          {!isRegister && (
            <>
              <div style={styles.divider}>
                <span style={styles.dividerLine}></span>
                <span style={styles.dividerText}>or continue with</span>
                <span style={styles.dividerLine}></span>
              </div>

              <div style={styles.socialRow}>
                <button style={styles.socialBtn} aria-label="Google">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </button>
                <button style={styles.socialBtn} aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <defs>
                      <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#feda75"/>
                        <stop offset="25%" stopColor="#fa7e1e"/>
                        <stop offset="50%" stopColor="#d62976"/>
                        <stop offset="75%" stopColor="#962fbf"/>
                        <stop offset="100%" stopColor="#4f5bd5"/>
                      </linearGradient>
                    </defs>
                    <rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="url(#ig)" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="5" fill="none" stroke="url(#ig)" strokeWidth="2"/>
                    <circle cx="17.5" cy="6.5" r="1.5" fill="url(#ig)"/>
                  </svg>
                </button>
                <button style={styles.socialBtn} aria-label="X">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#000">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>
              </div>
            </>
          )}

          <div style={styles.switchRow}>
            {isRegister ? (
              <span style={styles.switchText}>
                Already have an account?{" "}
                <span
                  style={styles.switchLink}
                  onClick={() => {
                    setIsRegister(false)
                    setError("")
                  }}
                >
                  Login Now
                </span>
              </span>
            ) : (
              <span style={styles.switchText}>
                Not a member?{" "}
                <span
                  style={styles.switchLink}
                  onClick={() => {
                    setIsRegister(true)
                    setError("")
                  }}
                >
                  Register Now
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        @keyframes floatUp {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes floatDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .login-input:focus {
          border-color: #7c5cbf !important;
          box-shadow: 0 0 0 3px rgba(124, 92, 191, 0.12);
        }

        @media (max-width: 900px) {
          .login-wrapper {
            flex-direction: column !important;
          }
          .login-left {
            display: none !important;
          }
          .login-right {
            border-radius: 0 !important;
            min-height: 100vh !important;
          }
        }
      `}</style>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    background: "#f5f5f5",
  },
  // ===== LEFT PANEL =====
  leftPanel: {
    flex: "0 0 42%",
    background: "linear-gradient(135deg, #8b6fc0 0%, #7c5cbf 30%, #a37dd6 70%, #9b7fd4 100%)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: "3rem",
    position: "relative",
    overflow: "hidden",
    minHeight: "100vh",
  },
  brandContent: {
    position: "relative",
    zIndex: 2,
    marginBottom: "2rem",
  },
  brandTitle: {
    color: "white",
    fontSize: "2.8rem",
    fontWeight: 800,
    lineHeight: 1.1,
    margin: 0,
    whiteSpace: "pre-line",
  },
  brandTagline: {
    color: "white",
    fontSize: "1.7rem",
    fontWeight: 700,
    lineHeight: 1.25,
    marginTop: "1.5rem",
    opacity: 0.95,
  },
  illustrationArea: {
    position: "relative",
    height: "300px",
    marginTop: "1rem",
  },
  clockCircle: {
    position: "absolute",
    top: "0",
    left: "0",
    animation: "floatUp 4s ease-in-out infinite",
    filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.15))",
  },
  stickyPink: {
    position: "absolute",
    top: "10px",
    right: "40px",
    width: "70px",
    height: "70px",
    background: "linear-gradient(135deg, #f8a4c8, #f472b6)",
    borderRadius: "6px",
    transform: "rotate(-5deg)",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    animation: "floatDown 3.5s ease-in-out infinite",
  },
  stickyYellow: {
    position: "absolute",
    top: "50px",
    right: "20px",
    width: "65px",
    height: "70px",
    background: "linear-gradient(135deg, #fde68a, #fbbf24)",
    borderRadius: "6px",
    transform: "rotate(3deg)",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    animation: "floatUp 4.5s ease-in-out infinite",
  },
  checklistCard: {
    position: "absolute",
    top: "100px",
    left: "30px",
    width: "180px",
    background: "white",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
    animation: "floatDown 5s ease-in-out infinite",
  },
  checklistLine: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  },
  checkboxDone: {
    width: "18px",
    height: "18px",
    borderRadius: "4px",
    background: "#7c5cbf",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "bold",
    flexShrink: 0,
  },
  checkboxEmpty: {
    width: "18px",
    height: "18px",
    borderRadius: "4px",
    border: "2px solid #ddd",
    flexShrink: 0,
    display: "inline-block",
  },
  lineText: {
    height: "8px",
    background: "#e5e7eb",
    borderRadius: "4px",
    flex: 1,
  },
  checkCircle: {
    position: "absolute",
    bottom: "20px",
    right: "60px",
    animation: "floatUp 3s ease-in-out infinite",
    filter: "drop-shadow(0 4px 15px rgba(46,204,113,0.3))",
  },
  dot: {
    position: "absolute",
    borderRadius: "50%",
  },

  // ===== RIGHT PANEL =====
  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "white",
    padding: "2rem",
    borderRadius: "24px 0 0 24px",
    marginLeft: "-24px",
    position: "relative",
    zIndex: 1,
    boxShadow: "-8px 0 30px rgba(0,0,0,0.08)",
    minHeight: "100vh",
    overflow: "auto",
  },
  formContainer: {
    width: "100%",
    maxWidth: "420px",
    animation: "fadeInUp 0.6s ease-out",
  },
  welcomeTitle: {
    textAlign: "center",
    fontSize: "2rem",
    fontWeight: 800,
    color: "#1a1a2e",
    margin: "0 0 0.5rem 0",
  },
  welcomeSubtitle: {
    textAlign: "center",
    color: "#666",
    fontSize: "0.9rem",
    lineHeight: 1.6,
    margin: "0 0 2rem 0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.2rem",
  },
  fieldGroup: {},
  input: {
    width: "100%",
    padding: "0.85rem 1rem",
    border: "none",
    borderBottom: "2px solid #e0e0e0",
    fontSize: "0.95rem",
    outline: "none",
    background: "transparent",
    color: "#333",
    transition: "border-color 0.3s",
    boxSizing: "border-box",
    fontFamily: "'Inter', sans-serif",
  },
  passwordWrapper: {
    position: "relative",
  },
  eyeBtn: {
    position: "absolute",
    right: "8px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
  },
  forgotRow: {
    textAlign: "right",
    marginTop: "0.4rem",
  },
  forgotLink: {
    color: "#7c5cbf",
    fontSize: "0.82rem",
    cursor: "pointer",
    fontWeight: 500,
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.85rem",
    color: "#555",
    cursor: "pointer",
  },
  checkbox: {
    accentColor: "#7c5cbf",
    width: "16px",
    height: "16px",
    cursor: "pointer",
  },
  link: {
    color: "#7c5cbf",
    textDecoration: "underline",
    cursor: "pointer",
    fontWeight: 500,
  },
  btnSubmit: {
    width: "100%",
    padding: "0.9rem",
    background: "linear-gradient(135deg, #9b8ec4, #7c5cbf)",
    color: "white",
    border: "none",
    borderRadius: "30px",
    cursor: "pointer",
    fontSize: "1.05rem",
    fontWeight: 700,
    letterSpacing: "0.5px",
    transition: "all 0.3s",
    boxShadow: "0 4px 15px rgba(124, 92, 191, 0.3)",
    marginTop: "0.5rem",
    fontFamily: "'Inter', sans-serif",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    margin: "1.5rem 0",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#e0e0e0",
  },
  dividerText: {
    color: "#999",
    fontSize: "0.82rem",
    whiteSpace: "nowrap",
  },
  socialRow: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    marginBottom: "1.5rem",
  },
  socialBtn: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    border: "1px solid #e0e0e0",
    background: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  switchRow: {
    textAlign: "center",
    marginTop: "1rem",
  },
  switchText: {
    color: "#666",
    fontSize: "0.9rem",
  },
  switchLink: {
    color: "#7c5cbf",
    fontWeight: 600,
    cursor: "pointer",
    textDecoration: "underline",
  },
  error: {
    background: "linear-gradient(135deg, #fee2e2, #fecaca)",
    color: "#dc2626",
    padding: "0.7rem 1rem",
    borderRadius: "8px",
    marginBottom: "0.5rem",
    fontSize: "0.88rem",
    textAlign: "center",
    fontWeight: 500,
  },
}

export default LoginPage