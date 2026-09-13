export interface FAQ {
  question: string
  answer: string
}

export interface FAQCategory {
  name: string
  faqs: FAQ[]
}

export const faqCategories: FAQCategory[] = [
  {
    name: 'Getting Started',
    faqs: [
      {
        question: 'What is Grid?',
        answer: 'Grid is a marketplace where everyone is verified. You sign up with your college or work email, and you land in your Hub — the people from your own campus or your own office. You buy, sell and request within that circle, so the person on the other end of a deal is someone who got in exactly the way you did.',
      },
      {
        question: 'Is Grid only for students?',
        answer: 'Not any more. Grid v1 was campus-only. v2 opens it to workplaces too, under the same rule: a verified organisation email gets you into that organisation\'s Hub. Campuses get Academic Hubs, companies get Corporate Hubs, and both work the same way.',
      },
      {
        question: 'What is a Hub?',
        answer: 'A Hub is your organisation on Grid — your college or your employer. Your email domain decides which one you belong to, and by default what you see is what people in your Hub have listed. It is the thing that makes Grid different from a general classifieds app: the circle is small, named and verified by construction.',
      },
      {
        question: 'When does Grid v2 launch?',
        answer: 'Soon — we are in the final stretch of the build, but we are not putting a date on it until we are certain we can hold it. Follow @gridmarketplace on Instagram and you will hear on the day it ships, on Android and iOS together.',
      },
      {
        question: 'How do I sign up?',
        answer: 'Enter your college or work email and we send you a one-time code. That is it — there is no password to create, and onboarding is two screens if your organisation is already on Grid. We check that the domain belongs to a real organisation before letting it through.',
      },
      {
        question: 'Can I sign up with Gmail?',
        answer: 'No. Personal domains like Gmail, Outlook and Yahoo are turned away deliberately. The whole guarantee Grid makes is that everyone in your Hub is verifiably from your organisation, and a personal email address cannot prove that. You need an address issued by your college or your employer.',
      },
      {
        question: 'I already use Grid. What happens to my account?',
        answer: 'v2 is a rebuild rather than an update, and it does not carry old accounts across — you will register again with your college or work email, and previous listings, chats and wallet balance do not transfer. It arrives as an update to the app you already have installed. If you have unspent credit on v1, contact us before v2 lands and we will sort it out.',
      },
      {
        question: 'Is Grid free to use?',
        answer: 'Browsing, searching, saving items and messaging are free, and so is widening your search beyond your own Hub. Posting a listing is a paid action — it is what keeps the feed free of junk. Pricing for v2 has not been announced yet; we will publish it before launch.',
      },
    ],
  },
  {
    name: 'Buying',
    faqs: [
      {
        question: 'How do I find items?',
        answer: 'Your home feed shows what is listed in your Hub. From there you can search, filter by category, price and condition, and sort by newest, nearest or price. There is also a map — tap a Hub pin and its listings slide up, which is the quickest way to see what a campus or office near you actually has.',
      },
      {
        question: 'Can I see listings outside my Hub?',
        answer: 'Yes, and it costs nothing. You can stay inside your own organisation, widen to nearby Hubs of the same type in 10, 25 and 50 km bands, or go global. That choice is yours and it is free on every tier — v1 locked you to your own campus, v2 does not.',
      },
      {
        question: 'How do I contact a seller?',
        answer: 'Open the listing and start a chat. You can negotiate, ask questions and settle the pickup in the same thread, and your phone number never changes hands.',
      },
      {
        question: 'How does making an offer work?',
        answer: 'Inside the chat you can propose a price, the seller can counter, and either of you can accept — the whole negotiation is structured rather than buried in messages. The listing stays pinned at the top of the thread and you can see what you would save as you type.',
      },
      {
        question: 'What if nobody has listed what I need?',
        answer: 'Post a request. It goes onto the request board for your Hub and into the Wanted Near You strip for people in range, and sellers come back with real priced offers you can counter or turn down. In v1 all you got was someone raising a hand; in v2 an offer arrives with a number attached.',
      },
      {
        question: 'How do I save items for later?',
        answer: 'Tap the heart on any listing to put it in your Stash. Everything you have saved lives in one place in your profile, so you can come back and pick the conversation up whenever you are ready.',
      },
      {
        question: 'What if an item is not as described?',
        answer: 'Report it from the listing. Reports carry context and go to our moderation team, who can warn the seller, pull the listing, or restrict and ultimately ban the account. We also recommend meeting in a public place and checking the item before you pay.',
      },
    ],
  },
  {
    name: 'Selling',
    faqs: [
      {
        question: 'How do I create a listing?',
        answer: 'Tap the create button, then fill in the title, description, price, category and condition and add your photos. Choose how far you want it to travel, confirm, and it goes live.',
      },
      {
        question: 'Who can see what I post?',
        answer: 'You decide, per listing, across four levels: just your hostel or building, your whole organisation, your Hub plus the ones it is paired with, or everyone within range. If you would rather a listing stayed close to home, it can.',
      },
      {
        question: 'Can I sell anonymously?',
        answer: 'Yes. You can hide your identity on a listing, and in v2 you can also go anonymous inside a single conversation. Either side can turn it on, at any point, and you never have to explain why.',
      },
      {
        question: 'How do I edit or delete a listing?',
        answer: 'Everything you have posted lives under My Listings in your profile. From there you can edit the details, mark something as sold, or remove it entirely.',
      },
      {
        question: 'What can I sell?',
        answer: 'Most of what changes hands around a campus or an office — electronics, furniture, books, appliances, sports gear, room and desk essentials. Prohibited items are listed in our Terms, and every listing is screened before it reaches the feed.',
      },
    ],
  },
  {
    name: 'Payments & Credits',
    faqs: [
      {
        question: 'How do payments work?',
        answer: 'Payments go through Apple In-App Purchase on iOS and Google Play Billing on Android. Grid never sees or stores your card details — the store handles that, under its own terms. v1 used a separate payment gateway; v2 does not.',
      },
      {
        question: 'How does the wallet work?',
        answer: 'You top the wallet up once and spend the credit on listings as you go, rather than paying separately every time. Your balance and full transaction history live in the Wallet section. Credit can carry an expiry — where it does, the expiry is shown before you buy.',
      },
      {
        question: 'Can I get a refund?',
        answer: 'Credit you have not spent yet can be returned on request — just contact us. Credit already spent on a listing cannot be refunded, since the listing has already run. Subscriptions can be cancelled at any time and you keep access until the end of the period you have paid for.',
      },
      {
        question: 'How much does posting cost?',
        answer: 'We have not announced v2 pricing yet and we would rather say nothing than publish a number we then change. It will be public before launch.',
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Yes, because Grid never handles it. Card and bank details are processed entirely by Apple or Google depending on your device, and nothing sensitive reaches our servers.',
      },
    ],
  },
  {
    name: 'Safety & Privacy',
    faqs: [
      {
        question: 'How does Grid keep me safe?',
        answer: 'The first safeguard is structural: everyone in your Hub verified through a real organisation email, has a reputation there, and has to keep seeing you around. On top of that, every listing is screened automatically before it goes live, our team reviews reports, and you can block or report anyone instantly.',
      },
      {
        question: 'Is content checked automatically?',
        answer: 'Yes. Every image you upload and every title and description you write is screened by automated moderation services before the listing reaches the feed, so nothing sits in public waiting for someone to notice and report it. Content that fails is blocked, and repeated breaches escalate — first the account is restricted, then suspended for seven days, then permanently removed. You can contact us if you believe a decision was wrong.',
      },
      {
        question: 'How do I report a listing or a user?',
        answer: 'Tap the report icon on any listing and pick a reason, or report a user from the chat screen. Reports go to our moderation team with context attached, and they can warn, restrict, remove content, or ban.',
      },
      {
        question: 'Can I block someone?',
        answer: 'Yes. Open the options menu in any conversation and tap Block User. Blocked people cannot message you, and you can manage the list from Settings.',
      },
      {
        question: 'Does Grid use my location?',
        answer: 'Grid uses approximate location to place Hubs on the map and to work out which Hubs fall inside the 10, 25 and 50 km bands when you widen your search. It is used to show you what is nearby — it is not used to target advertising, and your exact position is never shown to other users.',
      },
      {
        question: 'Does Grid show ads?',
        answer: 'Yes, sponsored listings appear in the feed. They are never targeted by gender — that was a deliberate decision about what we are willing to do with what we know about you, and we intend to keep it.',
      },
      {
        question: 'How is my data protected?',
        answer: 'Connections are encrypted, access is scoped so you can only reach your own data, and we do not sell, rent or trade personal data to advertisers or data brokers. Our Privacy Policy sets out exactly what we collect and why.',
      },
      {
        question: 'Can I export or delete my data?',
        answer: 'Yes, both from inside the app, in line with India\'s DPDP rules. You can download a copy of what Grid holds about you, or delete your account outright. If you have unspent wallet credit, request it back before you delete — deletion is irreversible. If you have an active subscription, cancel it separately through Apple or Google, since deleting your Grid account does not stop store billing.',
      },
      {
        question: 'Can I control my visibility?',
        answer: 'Yes. Under Settings, you can control your online status, read receipts and who is able to message you — and you can go anonymous on a listing or inside a single conversation whenever you want.',
      },
    ],
  },
  {
    name: 'Referral Program',
    faqs: [
      {
        question: 'How does the referral program work?',
        answer: 'Everyone gets a referral code. When someone joins Grid with yours, you earn credit. A marketplace of verified peers only works once your peers are actually on it, so bringing your batch or your team across makes the whole thing more useful for you too.',
      },
      {
        question: 'Where do I find my referral code?',
        answer: 'Profile, then Referrals. You can copy it or share it straight to a messaging app, and the same screen shows how many people you have invited, how many confirmed, and what you have earned.',
      },
      {
        question: 'Does referral credit expire?',
        answer: 'Credit can carry an expiry date. Where it does, the expiry is shown on the credit itself in your wallet, so you always know what you are holding and how long you have to use it.',
      },
      {
        question: 'Can I refer myself?',
        answer: 'No. Grid has fraud prevention including self-referral detection and rate limiting. Each referral has to be a genuine new person signing up for the first time.',
      },
    ],
  },
]
