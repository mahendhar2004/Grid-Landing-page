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
 * **This screen never checks whether you are an admin.** It cannot: the claim
 * is inside a signed token the server issues and verifies. A non-admin who
 * signs in here reaches the console shell and then gets 403 on every single
 * request behind it. That is the correct shape - the check belongs on the
 * server, and duplicating it here would only add a second place to get it
 * wrong.
 */
export function SignIn({ onSignedIn }: { onSignedIn: () => void }) {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

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
            <ErrorNote error={error} />
            <Button type="submit" variant="primary" disabled={busy || email.trim().length === 0}>
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
