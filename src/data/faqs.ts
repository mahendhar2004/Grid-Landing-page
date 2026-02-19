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
        answer: 'Grid is a campus-exclusive marketplace designed for Indian college students. It allows you to buy and sell items like textbooks, electronics, furniture, and more — exclusively within your college community. Think of it as a trusted marketplace where every buyer and seller is a verified student from your campus.',
      },
      {
        question: 'How do I sign up?',
        answer: 'Signing up is quick and easy. Simply download the Grid app, tap "Sign in with Google," and use your email to create your account. You\'ll then select your college, set your graduation year, and you\'re ready to start browsing and selling.',
      },
      {
        question: 'Which colleges are supported?',
        answer: 'Grid is expanding to 900+ premier institutions across India, including IITs, NITs, BITS, IIMs, VIT, SRM, Manipal, and many more. If your college isn\'t listed yet, you can request it to be added directly from the app.',
      },
      {
        question: 'Is Grid free to use?',
        answer: 'Yes, Grid is free to download and browse. There are affordable listing fees when you want to post an item for sale, which helps maintain quality and prevents spam. You can also earn free listing credits through our referral program.',
      },
      {
        question: 'How do I set up my profile?',
        answer: 'After signing in, you\'ll be guided through a simple onboarding flow where you select your college, graduation year, and hostel. You can later update your profile with a photo, phone number, and other details from the Profile section.',
      },
      {
        question: 'Can I use Grid if I\'ve graduated?',
        answer: 'Grid is primarily designed for currently enrolled students. However, recent graduates may still have access depending on their graduation year setting. The marketplace is scoped to your college community to ensure trust and relevance.',
      },
    ],
  },
  {
    name: 'Buying',
    faqs: [
      {
        question: 'How do I find items?',
        answer: 'Browse the home feed to see all items listed at your college. Use the search bar to find specific items, or filter by category (112+ options), price range, and condition (New, Like New, Good, Fair). You can also sort by newest, price, or popularity.',
      },
      {
        question: 'How do I contact a seller?',
        answer: 'Tap the "Contact Seller" button on any product listing to start a real-time chat. You can negotiate pricing, ask questions, and arrange pickup — all within the app. No need to share your phone number.',
      },
      {
        question: 'Can I see items from other colleges?',
        answer: 'No. Grid is intentionally college-scoped, meaning you can only see items listed by students at your own college. This ensures easy, local transactions with trusted community members — no traveling across the city for a meetup.',
      },
      {
        question: 'How do I save items for later?',
        answer: 'Tap the heart icon on any product to save it to your Stash (wishlist). You can access all your saved items from the Profile section. You\'ll be able to come back and contact the seller whenever you\'re ready.',
      },
      {
        question: 'What if I receive a different item than described?',
        answer: 'We encourage all sellers to provide accurate descriptions and photos. If you encounter a misleading listing, you can report it directly from the product page. Our admin team reviews reports and takes action including warnings, listing removal, or account bans for repeat offenders.',
      },
    ],
  },
  {
    name: 'Selling',
    faqs: [
      {
        question: 'How do I create a listing?',
        answer: 'Tap the "Sell" button in the center of the navigation bar. Fill in the title, description, price, category, and condition. Upload up to 5 photos, review your listing, pay the listing fee, and your item goes live to your college feed instantly.',
      },
      {
        question: 'What are listing fees?',
        answer: 'Grid charges a small, affordable listing fee for each item you post. This helps maintain marketplace quality by preventing spam and ensuring serious listings. You can pay via Razorpay, wallet balance, or use free listing credits earned through referrals.',
      },
      {
        question: 'How many images can I upload?',
        answer: 'You can upload up to 5 images per listing. Images are automatically optimized for fast loading while maintaining quality. We recommend including photos from multiple angles to help buyers make informed decisions.',
      },
      {
        question: 'Can I sell anonymously?',
        answer: 'Yes! When creating a listing, you can toggle the "Anonymous" option. Your item will appear with "Anonymous Seller" instead of your name. Buyers can still message you through the app, but your identity stays hidden until you choose to reveal it.',
      },
      {
        question: 'How do I edit or delete my listing?',
        answer: 'Go to "My Listings" from your profile. Tap any listing to edit its details (title, description, price, photos, etc.) or delete it entirely. You can also mark items as "Sold" when they\'re no longer available.',
      },
      {
        question: 'What categories are available?',
        answer: 'Grid offers 112+ categories across 8 groups: Tech & Electronics, Academic, Furniture, Kitchen & Appliances, Room Essentials, Fashion & Accessories, Sports & Fitness, and Lifestyle & Entertainment. From laptops to yoga mats, we\'ve got every student need covered.',
      },
    ],
  },
  {
    name: 'Payments & Wallet',
    faqs: [
      {
        question: 'What payment methods are accepted?',
        answer: 'Grid supports multiple payment options through Razorpay including credit/debit cards and UPI. You can also use your Grid Wallet balance or free listing credits. The payment process is secure and seamless.',
      },
      {
        question: 'How does the wallet work?',
        answer: 'The Grid Wallet lets you add funds via Razorpay and use them for listing fees. Top up once and use your balance for multiple listings. You can view your complete transaction history and current balance in the Wallet section.',
      },
      {
        question: 'Are listing fees refundable?',
        answer: 'Listing fees are generally non-refundable once your item is posted. This policy helps maintain the quality and seriousness of the marketplace. Make sure to review your listing carefully before confirming payment.',
      },
      {
        question: 'How do free listing credits work?',
        answer: 'You earn free listing credits by referring friends to Grid. Each successful referral earns you a credit that can be used instead of paying for a listing. Credits are applied automatically at checkout when available.',
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Absolutely. All payments are processed through Razorpay, a PCI DSS compliant payment gateway trusted by millions of businesses. Grid never stores your card or bank details — all sensitive payment data is handled by Razorpay\'s secure infrastructure.',
      },
    ],
  },
  {
    name: 'Safety & Privacy',
    faqs: [
      {
        question: 'How does Grid keep me safe?',
        answer: 'Grid employs multiple safety layers: college-scoped access ensures you\'re only interacting with verified campus students, a dedicated admin moderation team reviews reports, and you can block or report any suspicious users or listings instantly.',
      },
      {
        question: 'How do I report a suspicious listing or user?',
        answer: 'On any product page, tap the report icon and select a reason (spam, inappropriate, scam, or wrong category). For users, you can report from the chat screen. Reports include context and are reviewed by our admin team, who can warn, ban, or remove content.',
      },
      {
        question: 'Can I block someone?',
        answer: 'Yes. From any chat conversation, open the options menu and tap "Block User." Blocked users won\'t be able to message you. You can view and manage your blocked list from Settings.',
      },
      {
        question: 'Who moderates the content?',
        answer: 'Grid has a dedicated admin team with a full moderation dashboard. Admins review user reports, can view chat evidence, ban or warn users, remove inappropriate listings, and track platform activity in real-time.',
      },
      {
        question: 'How is my data protected?',
        answer: 'Your data is stored securely with Supabase using PostgreSQL with Row-Level Security policies, ensuring users can only access their own data. All connections are encrypted, and authentication is handled through Google OAuth. We never sell your data.',
      },
      {
        question: 'Can I control my online visibility?',
        answer: 'Yes. From Settings > Privacy, you can toggle your online status visibility, control read receipts, and manage messaging preferences. You can also list items anonymously to keep your identity private while selling.',
      },
    ],
  },
  {
    name: 'Referral Program',
    faqs: [
      {
        question: 'How does the referral program work?',
        answer: 'Every Grid user gets a unique referral code. Share it with friends — when they sign up using your code, you earn a free listing credit. It\'s our way of rewarding you for growing the campus community.',
      },
      {
        question: 'Where do I find my referral code?',
        answer: 'Go to Profile > Referrals to see your unique code. You can copy it to your clipboard or share it directly through messaging apps. The screen also shows your referral stats — total invited, confirmed, and credits earned.',
      },
      {
        question: 'What rewards do I get?',
        answer: 'For each successful referral (when your friend completes signup), you earn a free listing credit. This credit lets you post one item without paying the listing fee. There\'s no limit — the more friends you refer, the more credits you earn.',
      },
      {
        question: 'Can I refer myself?',
        answer: 'No. Grid has fraud prevention measures including self-referral detection, device fingerprinting, and rate limiting. Each referral must be a genuine new user signing up for the first time.',
      },
    ],
  },
]
