import {
  School, Layers, MessageCircle, SlidersHorizontal,
  ShieldCheck, Heart, EyeOff, Gift, Archive, Sparkles, HandCoins,
} from 'lucide-react'

export const features = [
  {
    icon: School,
    title: 'College-Scoped',
    description: 'Items are visible only within your campus. Browse, buy, and sell exclusively with verified students from your own college.',
    color: 'blue' as const,
  },
  {
    icon: Layers,
    title: '112+ Categories',
    description: 'From laptops and textbooks to gym gear, induction cooktops, and mini-fridges — everything a student could need across 8 specialized groups.',
    color: 'orange' as const,
  },
  {
    icon: MessageCircle,
    title: 'Real-Time Chat',
    description: 'Negotiate deals instantly with built-in messaging. See typing indicators, read receipts, and online status — no phone number sharing needed.',
    color: 'green' as const,
  },
  {
    icon: HandCoins,
    title: 'Make an Offer',
    description: 'Negotiate directly in-chat. Send an offer, counter-offer, or accept a deal — the full buying flow without ever leaving the app.',
    color: 'cyan' as const,
  },
  {
    icon: SlidersHorizontal,
    title: 'Smart Filters',
    description: 'Find exactly what you need. Filter by category, price range, and condition. Sort by newest, price, or popularity.',
    color: 'purple' as const,
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    description: 'Pay listing fees securely through Razorpay or use your Grid Wallet. Multiple payment options for a seamless experience.',
    color: 'teal' as const,
  },
  {
    icon: Heart,
    title: 'Wishlist — "The Stash"',
    description: 'Save items you love and come back to them later. Build your personal stash and never miss a great deal on campus.',
    color: 'pink' as const,
  },
  {
    icon: Archive,
    title: 'Chat Archive',
    description: 'Tidy up your inbox without losing history. Archive any conversation and bring it back instantly — your messages are always safe.',
    color: 'rose' as const,
  },
  {
    icon: EyeOff,
    title: 'Anonymous Listings',
    description: 'Want to sell discreetly? List items without revealing your identity. Your privacy, your choice.',
    color: 'slate' as const,
  },
  {
    icon: Sparkles,
    title: 'Beautifully Designed',
    description: 'Every screen, animation, and interaction is crafted to delight. Grid isn\'t just functional — it\'s a joy to use.',
    color: 'violet' as const,
  },
  {
    icon: Gift,
    title: 'Referral Rewards',
    description: 'Invite your batchmates and earn free listing credits. The more friends you bring, the more you save.',
    color: 'amber' as const,
  },
]

export const featureColors: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
  green: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-600' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-600' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-600' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  slate: { bg: 'bg-slate-100', text: 'text-slate-600' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
}
