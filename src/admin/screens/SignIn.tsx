import { useState } from 'react'

import { ApiError, sendOtp, verifyOtp } from '../lib/api'
import { Button, ErrorNote, Field, Panel } from '../components/ui'

/**
 * Sign in with the same email OTP the app uses.
 *
 * There is no separate admin credential, deliberately. A second password
 * store is a second thing to leak, and the admin claim already lives on the
 * user row - so being an admin is something an existing account *is*, not a
 * different way of logging in.
 *
 * **A non-admin is refused here, with a reason.** The previous version of
 * this comment claimed the screen *could not* know - that the claim was
 * "inside a signed token the server issues and verifies" - and concluded
 * that letting a non-admin in to collect 403s was the correct shape. Both
 * halves were wrong. The claim is readable: a JWT payload is base64 JSON,
 * and `isAdmin` is right there in it. And the resulting experience was a
 * console that signed you in and then failed every request, which reads as
 * broken software rather than as an account without access.
 *
 * So `verifyOtp` refuses the session when the claim is absent. That is a
 * *message*, not a security boundary - every admin route still checks
 * server-side on every request, and the worst a tampered token achieves
 * against this is the console shell that 403s on everything, which is
 * exactly what used to happen to everyone.
 *
 * **The consent box is real, not a schema formality.** `send-otp` records a
 * consent event against the address it is given, so the console has to have
 * actually shown the documents before it claims one. It sent none of these
 * fields at all until 17 Sep 2026, which is why every sign-in against the
 * real backend failed on `role`, `consentAccepted` and `ageConfirmed` at
 * once.
 */
export function SignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  /*
    Not a formality to get past the schema.

    `POST /v1/auth/send-otp` calls `recordConsent` with whatever is sent, so
    ticking this writes a consent record against the address. Sending `true`
    from a console that had never shown the documents would be recording a
    consent that did not happen - so the box is here, unticked, and the
    request cannot be made without it.
  */
  const [agreed, setAgreed] = useState(false)

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
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-page)] p-4">
      <Panel className="w-full max-w-sm p-6">
        <h1 className="text-lg font-bold text-[var(--color-text)]">Grid Console</h1>
        <p className="mb-5 mt-1 text-sm text-[var(--color-text-muted)]">
          {step === 'email' ? 'Sign in with your Grid account.' : `Enter the code sent to ${email}.`}
        </p>

        {step === 'email' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.edu" />

            <label className="flex cursor-pointer items-start gap-2 text-xs text-[var(--color-text-muted)]">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                className="mt-0.5"
                data-testid="admin-signin-consent"
              />
              <span>
                I am 18 or over and accept the{' '}
                <a href="/privacy" target="_blank" rel="noreferrer" className="underline">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="/terms" target="_blank" rel="noreferrer" className="underline">
                  Terms of Service
                </a>
                .
              </span>
            </label>

            <ErrorNote error={error} />
            <Button type="submit" variant="primary" disabled={busy || !agreed || email.trim().length === 0}>
              {busy ? 'Sending…' : 'Send code'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <Field
              label="Six-digit code"
              value={otp}
              onChange={setOtp}
              placeholder="000000"
              hint="Codes expire quickly - request a new one if it fails."
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
      </Panel>
    </div>
  )
}
