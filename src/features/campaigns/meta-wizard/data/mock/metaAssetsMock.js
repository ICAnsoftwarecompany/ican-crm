// Demo assets for the Ads step and conversion settings: lead forms, media
// library, Pixels, apps. The live endpoints are listed in pages/campaigns/pages/CampaignCreatePage/README_AR.md.

export const MOCK_LEAD_FORMS = Object.freeze([
  {
    id: 'mock-form-1001',
    name: 'Consultation request — Higher intent',
    status: 'ACTIVE',
    formType: 'higher_intent',
    questions: ['FULL_NAME', 'PHONE', 'CITY', 'CUSTOM'],
    leadsCount: 342,
    createdTime: '2026-08-12T10:00:00+03:00',
  },
  {
    id: 'mock-form-1002',
    name: 'Price list — More volume',
    status: 'ACTIVE',
    formType: 'more_volume',
    questions: ['FULL_NAME', 'PHONE', 'EMAIL'],
    leadsCount: 1210,
    createdTime: '2026-07-02T10:00:00+03:00',
  },
  {
    id: 'mock-form-1003',
    name: 'Old summer offer',
    status: 'ARCHIVED',
    formType: 'more_volume',
    questions: ['FULL_NAME', 'PHONE'],
    leadsCount: 88,
    createdTime: '2026-05-20T10:00:00+03:00',
  },
])

// Visual placeholders (gradients) keep the demo free of external images.
export const MOCK_MEDIA_LIBRARY = Object.freeze([
  { id: 'mock-img-1', type: 'image', name: 'offer-square.jpg', width: 1080, height: 1080, gradient: ['#00C2CB', '#1D4ED8'] },
  { id: 'mock-img-2', type: 'image', name: 'team-portrait.jpg', width: 1080, height: 1350, gradient: ['#F59E0B', '#DB2777'] },
  { id: 'mock-img-3', type: 'image', name: 'product-story.jpg', width: 1080, height: 1920, gradient: ['#10B981', '#0F766E'] },
  { id: 'mock-img-4', type: 'image', name: 'banner-wide.jpg', width: 1200, height: 628, gradient: ['#6366F1', '#A855F7'] },
  { id: 'mock-vid-1', type: 'video', name: 'testimonial.mp4', width: 1080, height: 1920, durationSeconds: 24, gradient: ['#111827', '#EF4444'] },
  { id: 'mock-vid-2', type: 'video', name: 'walkthrough.mp4', width: 1080, height: 1080, durationSeconds: 45, gradient: ['#0EA5E9', '#22C55E'] },
])

export const MOCK_PIXELS = Object.freeze([
  { id: 'mock-pixel-7788', name: 'Main website Pixel', lastFiredTime: '2026-09-30T21:00:00+03:00' },
  { id: 'mock-pixel-9911', name: 'Landing pages Pixel', lastFiredTime: '2026-09-14T09:00:00+03:00' },
])

export const MOCK_APPS = Object.freeze([
  { id: 'mock-app-3344', name: 'Company app (Android)', objectStoreUrl: 'https://play.google.com/store/apps/details?id=com.example.app' },
  { id: 'mock-app-3345', name: 'Company app (iOS)', objectStoreUrl: 'https://apps.apple.com/app/id000000000' },
])

export const MOCK_PAGE_POSTS = Object.freeze([
  { id: 'mock-post-1', message: 'New branch opening this week — visit us!', createdTime: '2026-09-25T12:00:00+03:00' },
  { id: 'mock-post-2', message: 'Customer story: how we helped 300 families', createdTime: '2026-09-18T12:00:00+03:00' },
])

export const MOCK_INSTAGRAM_ACCOUNTS = Object.freeze([
  { id: 'mock-ig-5566', username: 'company.eg' },
])

export const MOCK_WHATSAPP_NUMBERS = Object.freeze([
  { id: 'mock-wa-1', displayPhoneNumber: '+20 100 000 0000', verifiedName: 'Company Sales' },
])
