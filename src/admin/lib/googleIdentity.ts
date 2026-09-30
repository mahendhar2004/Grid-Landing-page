/**
 * Sign in with Google, from the browser (Google Identity Services).
 *
 * The console only shows the button when `VITE_GOOGLE_CLIENT_ID` was set at
 * build time, so an environment without it is exactly the email-code console
 * it was before. The client id is public by design (it identifies the app to
 * Google, it is not a secret); what protects the sign-in is that the server
 * verifies the returned ID token and checks the administrator allowlist.
 *
 * Google needs this site's origin listed as an authorised JavaScript origin on
 * the OAuth client, and the client id must be one the backend accepts
 * (`GOOGLE_OAUTH_CLIENT_IDS`).
 */
const SCRIPT_URL = 'https://accounts.google.com/gsi/client'

interface GoogleIdentity {
  accounts: {
    id: {
      initialize: (config: { client_id: string; callback: (response: { credential: string }) => void; ux_mode?: 'popup' }) => void
      renderButton: (element: HTMLElement, options: Record<string, unknown>) => void
    }
  }
}

declare global {
  interface Window {
    google?: GoogleIdentity
  }
}

export function googleClientId(): string | null {
  const value = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
  return value && value.trim().length > 0 ? value.trim() : null
}

let loading: Promise<GoogleIdentity> | null = null

function loadGoogle(): Promise<GoogleIdentity> {
  if (window.google) return Promise.resolve(window.google)
  if (loading) return loading
  loading = new Promise<GoogleIdentity>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => (window.google ? resolve(window.google) : reject(new Error('Google sign-in did not load.')))
    script.onerror = () => {
      loading = null
      reject(new Error('Google sign-in could not be reached. Use the emailed code instead.'))
    }
    document.head.appendChild(script)
  })
  return loading
}

/** Draws Google's button into `element` and calls `onCredential` with the ID token when someone signs in. */
export async function renderGoogleButton(
  element: HTMLElement,
  clientId: string,
  onCredential: (idToken: string) => void,
  theme: 'outline' | 'filled_black',
): Promise<void> {
  const google = await loadGoogle()
  google.accounts.id.initialize({ client_id: clientId, callback: (response) => onCredential(response.credential), ux_mode: 'popup' })
  google.accounts.id.renderButton(element, { theme, size: 'large', shape: 'pill', text: 'continue_with', width: 320 })
}
