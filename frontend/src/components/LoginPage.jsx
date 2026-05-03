import { useState } from "react"

function LoginPage({ onLogin, onRegister, onOpenAbout }) {
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
      <div style={styles.leftPanel}>
        <div style={styles.brandContent}>
          <h1 style={styles.brandTitle}>sowel{"\n"}task</h1>
          <p style={styles.brandTagline}>Stay on track, every day with everyone.</p>
        </div>
      </div>

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
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
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
                I agree to the <span style={styles.link}>terms of service</span> and{" "}
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
              {loading ? "Loading..." : isRegister ? "Register" : "Login"}
            </button>
          </form>

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
          <button type="button" style={styles.aboutButton} onClick={onOpenAbout}>
            About This Project
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
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
  aboutButton: {
    width: "100%",
    marginTop: "1rem",
    padding: "0.85rem",
    background: "transparent",
    color: "#7c5cbf",
    border: "1px solid #d6ccf5",
    borderRadius: "30px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: 700,
    fontFamily: "'Inter', sans-serif",
  },
}

export default LoginPage
