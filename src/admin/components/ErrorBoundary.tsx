import { Component, type ErrorInfo, type ReactNode } from 'react'

/**
 * Keeps one broken screen from taking the console with it.
 *
 * This is not hypothetical: a single `undefined.toFixed(4)` in the
 * Organizations list blanked the entire console, because a render error
 * anywhere unmounts the whole React tree. An admin looking at a white page
 * cannot tell a crash from a failed deploy, from being signed out, from the
 * API being down — and cannot reach any of the other six screens to find out.
 *
 * So each screen is wrapped on its own. A crash costs that screen and
 * nothing else: the nav still works, the other screens still load, and this
 * shows the actual error rather than hiding it, because the person reading
 * it is the person who will fix it.
 *
 * `resetKey` changes when the admin navigates. Without it a boundary stays
 * tripped forever — you would fix the data, come back, and still see the old
 * error with no way to retry short of a reload.
 */
interface Props {
  readonly children: ReactNode
  /** Changing this clears a tripped boundary — pass the current screen id. */
  readonly resetKey: string
  /** Named in the message, so "which screen" is not a guess. */
  readonly label: string
}

interface State {
  readonly error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidUpdate(previous: Props): void {
    if (previous.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // Kept in the console's own log as well as on screen: the stack is what
    // makes this fixable, and it is far longer than anything worth rendering.
    console.error(`[admin] ${this.props.label} crashed`, error, info.componentStack)
  }

  override render(): ReactNode {
    const { error } = this.state
    if (!error) {
      return this.props.children
    }

    return (
      <div
        className="space-y-3 rounded-lg border border-[var(--color-danger,#b91c1c)] p-5"
        data-testid="screen-error-boundary"
      >
        <h2 className="text-sm font-bold text-[var(--color-text)]">
          The {this.props.label} screen hit an error
        </h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          The rest of the console still works — switch tabs and come back. This is a bug in the console, not
          something you did.
        </p>
        {/* Shown, not swallowed. The person reading this is the person who
            will fix it, and a generic "something went wrong" would cost them
            a round trip through the browser console. */}
        <pre className="overflow-x-auto rounded bg-black/30 p-3 text-xs text-[var(--color-text)]">
          {error.message}
        </pre>
        <button
          onClick={() => this.setState({ error: null })}
          className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm font-semibold text-[var(--color-text)] hover:bg-white/5"
        >
          Try again
        </button>
      </div>
    )
  }
}
