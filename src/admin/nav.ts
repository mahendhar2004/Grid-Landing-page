import type { IconName } from './components/icons'

/**
 * Every screen in the console, once: its address, its name, its icon and the
 * group it belongs to. The sidebar, the breadcrumb, the command palette and the
 * router all read this list, so adding a screen is one entry here.
 */
export interface NavEntry {
  readonly id: string
  readonly label: string
  readonly icon: IconName
  readonly group: string
}

export const NAV: ReadonlyArray<NavEntry> = [
  { id: 'home', label: 'What needs you', icon: 'home', group: 'Moderate' },
  { id: 'reports', label: 'Reports', icon: 'flag', group: 'Moderate' },
  { id: 'triage', label: 'Inboxes', icon: 'inbox', group: 'Moderate' },
  { id: 'organization-review', label: 'Domain review', icon: 'building', group: 'Moderate' },
  { id: 'users', label: 'Members', icon: 'users', group: 'People' },
  { id: 'organizations', label: 'Organizations', icon: 'building', group: 'People' },
  { id: 'ads', label: 'Ads', icon: 'tag', group: 'Money' },
  { id: 'monetization', label: 'Monetization', icon: 'rupee', group: 'Money' },
  { id: 'analytics', label: 'Analytics', icon: 'chart', group: 'Money' },
  { id: 'audit', label: 'Audit log', icon: 'log', group: 'Records' },
]

export const NAV_GROUPS: ReadonlyArray<string> = [...new Set(NAV.map((entry) => entry.group))]
