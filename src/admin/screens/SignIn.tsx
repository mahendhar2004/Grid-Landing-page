import { useEffect, useRef, useState } from 'react'

import { ApiError, sendOtp, signInWithGoogle, verifyOtp } from '../lib/api'
import { googleClientId, renderGoogleButton } from '../lib/googleIdentity'
import { useTheme } from '../lib/theme'
import { Button, ErrorNote, Field } from '../components/ui'
import { Logo } from '../components/brand'

/**
 * Sign in with Google, or with the same email code the app uses.
 *
 * There is no separate admin credential, deliberately. A second password
 * store is a second thing to leak, and the admin claim already lives on the
 * user row - so being an admin is something an existing account *is*, not a
 * different way of logging in.
 *
 * **There is no age or consent tick box here.** It used to be, because the
 * app's sign-in records an 18+ attestation and a consent event against the
 * address. Ticking it to open an operations tool is not a member accepting the
 * Terms, so the console now says who is asking (`audience: ADMIN_CONSOLE`) and
 * the server sends a code only to an address on the administrator allowlist,
 * recording no consent, and answering the same way for anyone else so it cannot
 * be used to list the administrators.
 *
 * **A non-admin is refused here, with a reason.** `verifyOtp` refuses the
 * session when the token lacks the admin claim. That is a *message*, not a
 * security boundary - every admin route still checks server-side on every
 * request.
 */
export function SignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | Error | null>(null)
  const { theme } = useTheme()

  const clientId = googleClientId()
  const googleSlot = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!clientId || step !== 'email' || !googleSlot.current) return
    let cancelled = false
    renderGoogleButton(
      googleSlot.current,
      clientId,
      (idToken) => {
        if (cancelled) return
        setBusy(true)
        setError(null)
        signInWithGoogle(idToken)
          .then(onSignedIn)
          .catch((caught: unknown) => setError(caught as ApiError))
          .finally(() => setBusy(false))
      },
      theme === 'dark' ? 'filled_black' : 'outline',
    ).catch((caught: unknown) => {
      if (!cancelled) setError(caught as Error)
    })
    return () => {
      cancelled = true
    }
  }, [clientId, step, theme, onSignedIn])

  async function handleSendOtp(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await sendOtp(email.trim().toLowerCase())
      setStep('otp')
    } catch (caught) {
      setError(caught as ApiError)
    } finally {
      setBusy(false)
    }
  }

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await verifyOtp(email.trim().toLowerCase(), otp.trim())
      onSignedIn()
    } catch (caught) {
      setError(caught as ApiError)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center bg-[var(--c-bg)] p-4">
      <main className="w-full max-w-[420px] rounded-[var(--r-card)] border border-[var(--c-line)] bg-[var(--c-surface)] p-8 shadow-[var(--c-shadow-lg)]">
        <div className="mb-8 text-[var(--c-text)]">
          <Logo size={34} />
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-[28px] font-semibold leading-tight tracking-tight text-[var(--c-text)]">
          {step === 'email' ? 'Welcome back' : 'Check your email'}
        </h1>
        <p className="mb-6 mt-2 text-sm text-[var(--c-muted)]">
          {step === 'email'
            ? 'Sign in to run Grid.'
            : // Worded as a condition on purpose: the server sends a code only to an
              // administrator and answers everyone else the same way, so this screen
              // must not claim a code was sent.
              `If ${email} has console access, a six-digit code is on its way.`}
        </p>

        {step === 'email' ? (
          <div className="space-y-4">
            {clientId ? (
              <>
                {/* `color-scheme: light` on purpose. Google draws its button in an iframe, and a
                    browser only keeps an iframe transparent when its colour scheme
                    matches the page around it; on the dark console the page is dark,
                    so the iframe went opaque white and showed as a white box behind
                    the pill. Pinning this box to light keeps the iframe transparent in
                    both themes, and the button still follows the theme (see `theme`). */}
                <div
                  className="flex justify-center"
                  style={{ colorScheme: 'light' }}
                  ref={googleSlot}
                  data-testid="admin-signin-google"
                />
                <div className="flex items-center gap-3 text-xs text-[var(--c-faint)]" aria-hidden="true">
                  <span className="h-px flex-1 bg-[var(--c-line)]" />
                  or use an email code
                  <span className="h-px flex-1 bg-[var(--c-line)]" />
                </div>
              </>
            ) : null}
            <form onSubmit={handleSendOtp} className="space-y-4">
              <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@yourorganisation.com" />
              <ErrorNote error={error} />
              <div className="flex">
                <Button type="submit" variant="primary" disabled={busy || email.trim().length === 0}>
                  {busy ? 'Sending…' : 'Send code'}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <Field
              label="Six-digit code"
              value={otp}
              onChange={setOtp}
              placeholder="000000"
              hint="No code after a minute? Only addresses with console access receive one. Check the spelling, or ask an existing admin to add you. Google sign-in tells you straight away."
            />
            <ErrorNote error={error} />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setStep('email')
                  setOtp('')
                  setError(null)
                }}
              >
                Back
              </Button>
              <Button type="submit" variant="primary" disabled={busy || otp.trim().length !== 6}>
                {busy ? 'Checking…' : 'Sign in'}
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
