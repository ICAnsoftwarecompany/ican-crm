// Demo targeting catalog (interests, behaviours, languages, audiences).
// Shape follows Meta's Targeting Search / customaudiences responses.

const interest = (id, en, ar, path, size) => ({ id, type: 'interests', name: { en, ar }, path, audienceSize: size })
const behavior = (id, en, ar, size) => ({ id, type: 'behaviors', name: { en, ar }, path: ['Behaviors'], audienceSize: size })

export const MOCK_DETAILED_TARGETING = Object.freeze([
  interest('mock-6003139266461', 'Real estate', 'العقارات', ['Interests', 'Business and industry'], 12_000_000),
  interest('mock-6003384248805', 'Fitness and wellness', 'اللياقة والصحة', ['Interests', 'Fitness and wellness'], 18_000_000),
  interest('mock-6003020834693', 'Online shopping', 'التسوق عبر الإنترنت', ['Interests', 'Shopping and fashion'], 25_000_000),
  interest('mock-6003397425735', 'Fashion', 'الموضة', ['Interests', 'Shopping and fashion'], 21_000_000),
  interest('mock-6003107902433', 'Education', 'التعليم', ['Interests', 'Education'], 16_000_000),
  interest('mock-6003012317397', 'Cars', 'السيارات', ['Interests', 'Hobbies and activities', 'Vehicles'], 14_000_000),
  interest('mock-6003349442621', 'Travel', 'السفر', ['Interests', 'Hobbies and activities'], 19_000_000),
  interest('mock-6003384912200', 'Restaurants', 'المطاعم', ['Interests', 'Food and drink'], 17_000_000),
  interest('mock-6003277229526', 'Beauty', 'التجميل', ['Interests', 'Shopping and fashion'], 15_000_000),
  interest('mock-6003248297213', 'Small business', 'المشروعات الصغيرة', ['Interests', 'Business and industry'], 9_000_000),
  interest('mock-6003020839300', 'Entrepreneurship', 'ريادة الأعمال', ['Interests', 'Business and industry'], 8_000_000),
  interest('mock-6003106798512', 'Mobile phones', 'الهواتف المحمولة', ['Interests', 'Technology'], 22_000_000),
  interest('mock-6003302137100', 'Interior design', 'التصميم الداخلي', ['Interests', 'Family and relationships'], 7_000_000),
  interest('mock-6003140523219', 'Healthcare', 'الرعاية الصحية', ['Interests', 'Fitness and wellness'], 10_000_000),
  interest('mock-6003384911800', 'Football', 'كرة القدم', ['Interests', 'Sports and outdoors'], 30_000_000),
  behavior('mock-6002714895372', 'Frequent travellers', 'المسافرون بشكل متكرر', 3_000_000),
  behavior('mock-6004854404172', 'Engaged shoppers', 'المتسوقون النشطون', 11_000_000),
  behavior('mock-6015235495383', 'Small business owners', 'أصحاب المشروعات الصغيرة', 2_000_000),
  behavior('mock-6002714898572', 'Expats (all)', 'المغتربون', 4_000_000),
])

export const MOCK_LANGUAGES = Object.freeze([
  { id: 28, name: { en: 'Arabic', ar: 'العربية' } },
  { id: 1001, name: { en: 'English (All)', ar: 'الإنجليزية (الكل)' } },
  { id: 1002, name: { en: 'French (All)', ar: 'الفرنسية (الكل)' } },
  { id: 1003, name: { en: 'German', ar: 'الألمانية' } },
  { id: 1004, name: { en: 'Turkish', ar: 'التركية' } },
])

export const MOCK_CUSTOM_AUDIENCES = Object.freeze([
  { id: 'mock-ca-crm-customers', name: 'CRM — Won customers', subtype: 'CUSTOM', approximateCount: 4200 },
  { id: 'mock-ca-crm-leads-90d', name: 'CRM — Leads last 90 days', subtype: 'CUSTOM', approximateCount: 18_500 },
  { id: 'mock-ca-website-30d', name: 'Website visitors — 30 days', subtype: 'WEBSITE', approximateCount: 9800 },
  { id: 'mock-ca-engaged-page', name: 'Page engagers — 365 days', subtype: 'ENGAGEMENT', approximateCount: 56_000 },
  { id: 'mock-lal-customers-1', name: 'Lookalike (EG, 1%) — Won customers', subtype: 'LOOKALIKE', approximateCount: 520_000 },
])
