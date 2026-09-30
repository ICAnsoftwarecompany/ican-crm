// Meta campaign wizard (features/campaigns/meta-wizard). Keep keys in sync with ../ar/campaignWizard.js.
export default {
  "common": {
    "optional": "Optional", "recommended": "Recommended", "choose": "Choose…", "remove": "Remove", "duplicate": "Duplicate", "edit": "Edit", "cancel": "Cancel",
    "loading": "Loading…", "loadError": "Couldn't load this list. Try again later.", "addCountry": "Add a country…", "listSeparator": ", ",
    "characters": "{{count}}/{{max}} recommended characters", "stepOf": "Step {{current}} of {{total}}", "stepsLabel": "Campaign creation steps",
    "youWillNeed": "Have these ready:", "demoData": "Demo data", "demoDataHint": "Sample data shown until this Meta API is connected. Real data will replace it automatically."
  },
  "names": { "campaign": "New campaign", "adSet": "Ad set", "adSetNumber": "Ad set {{count}}" },
  "header": {
    "account": "Ad account: {{name}}", "saveDraft": "Save draft", "savedAt": "Saved {{time}}", "savedToast": "Draft saved", "nothingToSave": "Start filling the campaign — it will be saved automatically.",
    "completion": "Campaign completeness", "currencyFallback": "The ad account didn't report its currency; the default is shown.",
    "saveStatus": { "unsaved": "Saving…", "failed": "Couldn't save in this browser", "new": "Not saved yet" }
  },
  "footer": {
    "back": "Back", "continue": "Continue", "blockingStage": "{{count}} item(s) to complete in this step", "blockingTotal": "{{count}} item(s) must be fixed before publishing",
    "fixStage": "Complete {{count}} required item(s) in this step first", "fixAll": "Fix {{count}} item(s) before publishing"
  },
  "stages": {
    "objective": {
      "title": "What do you want this campaign to achieve?", "short": "Objective",
      "intro": "Start from a ready-made template for the most common goals, or pick the Meta objective yourself. The objective decides where results happen and what Meta optimizes for.",
      "guide": "Not sure? For collecting customer data in Egypt, “Leads via Instant Form” or “WhatsApp messages” are the most common and fastest to launch.",
      "need1": "What counts as a result for you (a lead, a message, a sale, a visit)", "need2": "Where you want people to go (form, WhatsApp, website, call)",
      "tip1": "Templates fill every technical setting for you; you can still change anything later.", "tip2": "The objective can't be changed after publishing — you'd duplicate the campaign instead.", "tip3": "Sales and website-lead objectives need a working Pixel or Conversions API."
    },
    "campaignSetup": {
      "title": "Campaign details and budget", "short": "Campaign",
      "intro": "Name the campaign, choose the Facebook Page it runs from, declare any special ad category, and decide how the budget is controlled and when the campaign runs.",
      "guide": "Advantage campaign budget lets Meta move money to the best-performing ad set automatically — it's the right choice for most campaigns.",
      "need1": "The Facebook Page the ads will appear from", "need2": "Your daily or total budget in the ad account currency", "need3": "Start and end dates, if the campaign is time-limited",
      "tip1": "Use a naming pattern (product – audience – month) so reports stay readable.", "tip2": "Housing, employment and financial ads must declare a special category or Meta may reject them.", "tip3": "Give a new campaign at least 3–5 days before judging results."
    },
    "adSets": {
      "title": "Ad sets: destination, audience and placements", "short": "Ad sets",
      "intro": "Each ad set defines where results happen, who sees the ads, where the ads appear, and (if you chose it) its own budget. Add more ad sets to test different audiences.",
      "guide": "Start broad: one ad set with your target locations and Advantage+ audience usually beats many narrow ones.",
      "need1": "The areas you serve (countries, governorates, cities or exact points)", "need2": "Contact details for the destination (WhatsApp number, Pixel, app…)", "need3": "Age range and any interests or saved audiences",
      "tip1": "Exclude areas you don't serve instead of listing every city you do.", "tip2": "A reach between tens of thousands and a few million gives Meta room to optimize.", "tip3": "Use a radius around a city or a dropped pin for local businesses."
    },
    "ads": {
      "title": "Ads: creatives, text and destination", "short": "Ads",
      "intro": "Create the ads for each ad set: choose the format, media and text, the button, and where the button leads (website, instant form, chat or call).",
      "guide": "Add 2–3 text variants and more than one ad per ad set so Meta can find the best combination.",
      "need1": "Images (1080×1080) or vertical videos (9:16)", "need2": "Main text, headline and the destination link or form", "need3": "A privacy policy link if you create a new instant form",
      "tip1": "Put the key offer in the first 125 characters — longer text gets cut off.", "tip2": "Vertical video performs best in Stories and Reels.", "tip3": "Use UTM parameters so website visits are attributed to this campaign."
    },
    "review": {
      "title": "Review and publish", "short": "Review",
      "intro": "Check the summary, fix anything flagged, decide which sales team receives the leads, then publish. Campaigns are created paused by default so you can double-check in Ads Manager.",
      "guide": "Publishing is safe to retry: if a step fails, fix it and press “Resume publishing” — nothing already created is duplicated.",
      "tip1": "Paused is recommended for the first launch — activate after a final look.", "tip2": "Routing leads to a team here means they're assigned the moment they arrive."
    }
  },
  "objectiveStep": {
    "presetsTitle": "Quick start templates", "presetsDescription": "Pick what you want to achieve — we set the objective, destination and optimization for you.",
    "objectivesTitle": "Or choose the Meta objective", "objectivesDescription": "For experienced advertisers: pick the objective and configure every detail in the next steps.",
    "lockedNote": "The objective can't be changed after publishing — duplicate the campaign with a new objective instead."
  },
  "presets": {
    "leads_instant_form": { "title": "Leads via Instant Form", "description": "People fill a short form inside Facebook/Instagram; leads land directly in the CRM." },
    "whatsapp_messages": { "title": "WhatsApp messages", "description": "The ad opens a WhatsApp chat with your business number." },
    "messenger_messages": { "title": "Messenger messages", "description": "The ad opens a Messenger conversation with your Page." },
    "phone_calls": { "title": "Phone calls", "description": "The button calls your business directly." },
    "website_leads": { "title": "Leads on your website", "description": "Optimize for sign-ups or form submissions tracked by your Pixel." },
    "website_traffic": { "title": "Website visits", "description": "Bring people to a landing page or website." },
    "website_sales": { "title": "Online sales", "description": "Optimize for purchases tracked by your Pixel or Conversions API." },
    "video_views": { "title": "Video views", "description": "Get your video watched by as many relevant people as possible." },
    "page_likes": { "title": "Page likes", "description": "Grow your Facebook Page audience." },
    "brand_awareness": { "title": "Brand awareness", "description": "Reach the most people in your area for the lowest cost." },
    "app_installs": { "title": "App installs", "description": "Get people to install your mobile app." }
  },
  "objectives": {
    "OUTCOME_AWARENESS": { "title": "Awareness", "description": "Show your ad to as many people as possible and help them remember your brand." },
    "OUTCOME_TRAFFIC": { "title": "Traffic", "description": "Send people to a website, app, chat or profile." },
    "OUTCOME_ENGAGEMENT": { "title": "Engagement", "description": "Get messages, video views, post engagement or Page likes." },
    "OUTCOME_LEADS": { "title": "Leads", "description": "Collect contact details through forms, chats, calls or your website." },
    "OUTCOME_SALES": { "title": "Sales", "description": "Find people likely to buy — needs a Pixel or Conversions API." },
    "OUTCOME_APP_PROMOTION": { "title": "App promotion", "description": "Get app installs or actions inside your app." }
  },
  "locations": {
    "default": { "title": "Automatic", "description": "Meta decides where to show the ad.", "adHint": "Choose the button and, optionally, where it leads." },
    "website": { "title": "Website", "description": "People go to your website or landing page.", "adHint": "Add the landing page URL and tracking parameters." },
    "app": { "title": "App", "description": "People open or install your app.", "adHint": "The ad sends people to the app store link set in the ad set." },
    "website_and_app": { "title": "Website and app", "description": "Meta sends people to your app or website — whichever converts better.", "adHint": "Add the website URL; the app link comes from the ad set." },
    "instant_form": { "title": "Instant form", "description": "A form opens inside Facebook/Instagram with the person's details pre-filled.", "adHint": "Choose an existing instant form or build a new one." },
    "messenger": { "title": "Messenger", "description": "The ad opens a Messenger chat with your Page.", "adHint": "Write the welcome message and suggested questions." },
    "whatsapp": { "title": "WhatsApp", "description": "The ad opens a WhatsApp chat with your business number.", "adHint": "Write the pre-filled message people send you." },
    "instagram_direct": { "title": "Instagram Direct", "description": "The ad opens an Instagram DM with your account.", "adHint": "Write the welcome message and suggested questions." },
    "messaging_apps": { "title": "Messaging apps", "description": "Meta picks Messenger or WhatsApp for each person.", "adHint": "Write the welcome message and suggested questions." },
    "instagram_profile": { "title": "Instagram profile", "description": "People visit your Instagram profile.", "adHint": "The button opens your Instagram profile." },
    "phone_call": { "title": "Calls", "description": "The button calls your business.", "adHint": "Add the phone number people will call." },
    "post": { "title": "On your ad", "description": "Reactions, comments and shares on the ad itself.", "adHint": "Choose the button, or none for pure engagement." },
    "video": { "title": "Video", "description": "Views of your video ad.", "adHint": "Use a video format for this ad." },
    "page": { "title": "Facebook Page", "description": "Likes and follows for your Page.", "adHint": "The button asks people to like your Page." },
    "event": { "title": "Event", "description": "Responses to your Facebook event.", "adHint": "The button lets people respond to your event." }
  },
  "goals": {
    "REACH": { "title": "Reach", "description": "Show the ad to as many unique people as possible." },
    "IMPRESSIONS": { "title": "Impressions", "description": "Show the ad as many times as possible." },
    "AD_RECALL_LIFT": { "title": "Ad recall lift", "description": "Reach people likely to remember your ad." },
    "THRUPLAY": { "title": "ThruPlay", "description": "Views of 15 seconds or the full video if shorter." },
    "TWO_SECOND_CONTINUOUS_VIDEO_VIEWS": { "title": "2-second video views", "description": "People who watch at least 2 continuous seconds." },
    "LANDING_PAGE_VIEWS": { "title": "Landing page views", "description": "People who click and wait for your page to load — better quality than clicks." },
    "LINK_CLICKS": { "title": "Link clicks", "description": "As many clicks on the ad link as possible." },
    "VISIT_INSTAGRAM_PROFILE": { "title": "Instagram profile visits", "description": "People who visit your Instagram profile." },
    "CONVERSATIONS": { "title": "Conversations", "description": "People likely to start a chat with you." },
    "POST_ENGAGEMENT": { "title": "Post engagement", "description": "Reactions, comments and shares." },
    "PAGE_LIKES": { "title": "Page likes", "description": "People likely to like your Page." },
    "EVENT_RESPONSES": { "title": "Event responses", "description": "People likely to respond to your event." },
    "QUALITY_CALL": { "title": "Calls", "description": "People likely to call you for at least 60 seconds." },
    "OFFSITE_CONVERSIONS": { "title": "Conversions", "description": "People likely to complete the selected Pixel/app event." },
    "VALUE": { "title": "Conversion value", "description": "People likely to spend the most — needs purchase values." },
    "LEAD_GENERATION": { "title": "Leads", "description": "As many form submissions as possible." },
    "QUALITY_LEAD": { "title": "Conversion leads", "description": "Leads most likely to become customers (needs CRM feedback to Meta)." },
    "APP_INSTALLS": { "title": "App installs", "description": "People likely to install your app." }
  },
  "specialCategories": {
    "HOUSING": { "title": "Housing" }, "EMPLOYMENT": { "title": "Employment" },
    "FINANCIAL_PRODUCTS_SERVICES": { "title": "Financial products and services" }, "ISSUES_ELECTIONS_POLITICS": { "title": "Social issues, elections or politics" }
  },
  "campaignSetup": {
    "basicsTitle": "Campaign identity", "basicsDescription": "How the campaign appears in reports, and the Page it runs from.",
    "name": "Campaign name", "nameHint": "Only you see this. Leave it empty to use the suggested name.", "useSuggestedName": "Use suggestion",
    "page": "Facebook Page", "selectPage": "Select a Page", "pageHint": "Ads show this Page's name and picture. Leads and messages arrive on it.",
    "noPagesTitle": "No Facebook Page is connected", "noPagesBody": "Connect a Page from Settings → Integrations → Meta, then come back — your progress is saved.",
    "specialTitle": "Special ad category", "specialDescription": "Required by Meta for ads about housing, employment, financial services or politics.",
    "specialNone": "None selected — correct for most businesses.", "specialNoneShort": "None",
    "specialCountries": "Countries where these ads run", "specialCountriesHint": "Meta needs the countries the special category applies to.",
    "restrictedTitle": "Targeting will be limited", "restrictedBody": "Age is fixed to 18–65+, gender can't be chosen, detailed exclusions and lookalike audiences are unavailable, and location radius must be at least 25 km.",
    "budgetStrategyTitle": "Budget strategy", "budgetStrategyDescription": "Choose who controls the spend between ad sets.",
    "budgetLevels": {
      "campaign": { "title": "Advantage campaign budget", "description": "One budget for the whole campaign; Meta moves it to the best ad sets automatically." },
      "adSet": { "title": "Budget per ad set", "description": "Each ad set spends its own fixed budget — useful for fair A/B tests." }
    },
    "budgetTitle": "Campaign budget", "budgetDescription": "The amount Meta can spend, in the ad account currency.",
    "adSetBudgetTitle": "You'll set budgets in the ad sets step", "adSetBudgetBody": "Each ad set will ask for its own daily or lifetime budget.",
    "spendCap": "Campaign spending limit", "spendCapHint": "Total the campaign can ever spend; it stops when reached.",
    "scheduleTitle": "Schedule", "scheduleDescription": "Applies to every ad set in the campaign.", "scheduleDefaultDescription": "Default schedule for ad sets — each ad set can override it."
  },
  "budget": {
    "type": "Budget type", "daily": "Daily", "lifetime": "Lifetime", "dailyAmount": "Daily budget", "lifetimeAmount": "Total (lifetime) budget",
    "dailyHint": "Average spend per day; some days may spend up to 75% more, balanced over the week.", "lifetimeHint": "Total spend over the whole schedule — needs an end date.",
    "minimumHint": "Suggested minimum: {{minimum}} {{currency}} per day.", "bidStrategy": "Bid strategy", "roasHint": "Example: 2 means every 1 spent should bring back at least 2 in value.",
    "strategies": {
      "highest_volume": { "title": "Highest volume", "hint": "Spend the full budget to get the most results. Best for most campaigns." },
      "cost_cap": { "title": "Cost per result goal", "hint": "Keep the average cost per result around your target.", "amountLabel": "Target cost per result" },
      "bid_cap": { "title": "Bid cap", "hint": "Never bid more than this in any auction — for advanced advertisers.", "amountLabel": "Maximum bid" },
      "highest_value": { "title": "Highest value", "hint": "Spend the full budget to get the most purchase value." },
      "minimum_roas": { "title": "ROAS goal", "hint": "Keep return on ad spend above your floor.", "amountLabel": "Minimum ROAS" }
    }
  },
  "schedule": {
    "start": "Start", "startNow": "As soon as it's approved", "startLater": "On a date", "end": "End", "endNever": "Run continuously", "endOn": "On a date",
    "lifetimeNeedsEnd": "A lifetime budget needs an end date.", "dayparting": "Run ads on a schedule", "daypartingHint": "Only show ads on the selected days and hours.",
    "daypartingNeedsLifetime": "Available with a lifetime budget only.", "from": "From", "to": "to", "viewerTimezone": "in the viewer's time zone",
    "days": { "0": "Sun", "1": "Mon", "2": "Tue", "3": "Wed", "4": "Thu", "5": "Fri", "6": "Sat" }
  },
  "adSets": {
    "tabsLabel": "Ad sets", "add": "Add ad set", "multipleHint": "Tip: add a second ad set to test a different audience or area.",
    "chooseObjectiveFirst": "Choose an objective in step 1 first.",
    "destinationTitle": "Name, destination and optimization", "destinationDescription": "Where results happen and what Meta should optimize for.",
    "name": "Ad set name", "nameHint": "Leave empty to name it from the destination and locations.",
    "conversionLocation": "Conversion location", "performanceGoal": "Performance goal",
    "connectedWhatsapp": "Connected WhatsApp numbers", "whatsappNumber": "WhatsApp business number", "whatsappHint": "International format, e.g. +201001234567. Local 01… numbers are converted automatically.",
    "instagramAccount": "Instagram account", "pixel": "Pixel", "pixelHint": "The Pixel installed on the landing page.", "conversionEvent": "Conversion event",
    "app": "App", "storeUrl": "App store link", "appEvent": "App event", "eventId": "Facebook event ID", "eventIdHint": "The numeric ID from the event link.",
    "frequencyMax": "Show each person at most (times)", "frequencyInterval": "Every (days)",
    "adLevelNote": "You'll add the {{items}} in the Ads step.", "adLevelItems": { "leadForm": "instant form", "phone": "phone number", "websiteUrl": "website link" },
    "locationsTitle": "Locations", "locationsDescription": "Where the people you want to reach live or are.",
    "audienceTitle": "Audience", "audienceDescription": "Age, gender, languages, interests and saved audiences.",
    "placementsTitle": "Placements", "placementsDescription": "Where your ads appear across Meta's apps.",
    "budgetTitle": "Budget and schedule", "budgetDescription": "This ad set's own budget and dates.",
    "scheduleTitle": "Schedule", "scheduleInherited": "Uses the campaign budget and schedule. You can still limit it to certain days and hours.",
    "useCampaignSchedule": "Use the campaign schedule", "useCampaignScheduleHint": "Turn off to give this ad set its own start and end dates."
  },
  "geo": {
    "locationType": "Target people who are", "mode": "Include or exclude",
    "locationTypes": {
      "home_or_recent": { "title": "Living in or recently in this location", "hint": "Recommended — people who live there or were there recently." },
      "home": { "title": "Living in this location", "hint": "People whose home is in the selected places." },
      "recent": { "title": "Recently in this location", "hint": "People whose latest location was there — including visitors." },
      "travel_in": { "title": "Traveling in this location", "hint": "People more than 200 km from home who are there now." }
    },
    "include": "Include", "exclude": "Exclude", "searchPlaceholder": "Search a country, governorate, city or area…", "searchExcludePlaceholder": "Search a place to exclude…",
    "resultsHint": "Click to add · + include · − exclude", "noResults": "No places match “{{query}}”.", "searchError": "Location search failed. Try again.", "alreadyAdded": "Added",
    "bulk": "Add in bulk", "dropPin": "Drop pin",
    "types": { "country": "Country", "region": "Governorate / region", "city": "City", "neighborhood": "Area", "zip": "Postal code", "custom_location": "Pin" },
    "radius": "Radius", "openMap": "Open in map", "switchToInclude": "Include instead", "switchToExclude": "Exclude instead", "excludedTag": "Excluded",
    "includedTitle": "Included ({{count}})", "excludedTitle": "Excluded ({{count}})", "empty": "No locations yet. Search above to add where your customers are.",
    "bulkTitle": "Add locations in bulk", "bulkDescription": "Paste one location per line (or separated by commas).", "bulkPlaceholder": "Cairo\nGiza\nAlexandria\nMansoura",
    "bulkMatch": "Find locations", "bulkAdd": "Add {{count}} location(s)", "bulkMatched": "Found {{count}} location(s)", "bulkUnmatched": "{{count}} not found — check spelling",
    "pinTitle": "Drop a pin", "pinDescription": "Target a radius around an exact point, like a branch or a mall.", "pinCoordinates": "Coordinates",
    "pinHint": "Paste “latitude, longitude” or a Google Maps link.", "pinInvalid": "Couldn't read coordinates from this text.", "pinLabel": "Label", "pinLabelPlaceholder": "e.g. Nasr City branch", "pinAdd": "Add pin"
  },
  "audience": {
    "advantageTitle": "Advantage+ audience", "advantageOn": "On: your choices below are suggestions; Meta may reach beyond them when it expects better results.",
    "advantageOff": "Off: only people matching your exact choices are targeted.", "advantageRestricted": "Not available with a special ad category.",
    "restrictedTitle": "Special ad category limits", "restrictedBody": "Age and gender are locked and detailed exclusions are unavailable.",
    "age": "Age", "ageSuggestion": "Age (suggestion)", "ageMin": "Minimum age", "ageMax": "Maximum age", "gender": "Gender",
    "genders": { "all": "All", "male": "Men", "female": "Women" },
    "languages": "Languages", "languagesHint": "Leave empty unless the audience uses a language uncommon in the selected locations.",
    "interests": "Detailed targeting", "interestsSuggestion": "Detailed targeting (suggestions)", "interestsPlaceholder": "Search interests or behaviors…", "noInterests": "No matches.",
    "exclusions": "Exclude people who match", "exclusionsRestricted": "Not allowed with this special ad category.",
    "targetingTypes": { "interests": "Interest", "behaviors": "Behavior" },
    "customAudiences": "Saved audiences", "audienceNone": "Off",
    "audienceTypes": { "CUSTOM": "Customer list", "WEBSITE": "Website visitors", "ENGAGEMENT": "Engagement", "LOOKALIKE": "Lookalike" },
    "reachTitle": "Estimated audience size", "reachRange": "{{lower}} – {{upper}} people", "reachUnknown": "Add at least one location to estimate.",
    "narrow": "Specific", "broad": "Broad",
    "reachLevels": { "none": "No estimate yet.", "narrow": "Very specific — Meta may struggle to spend the budget. Consider widening locations or age.", "good": "A healthy size for delivery.", "broad": "Very broad — fine with Advantage+; add locations or exclusions if you only serve some areas." }
  },
  "placements": {
    "advantage": { "title": "Advantage+ placements", "description": "Recommended. Meta shows ads wherever they perform best." },
    "manual": { "title": "Manual placements", "description": "Choose the exact apps and positions." },
    "devices": "Devices", "deviceTypes": { "mobile": "Mobile", "desktop": "Desktop" },
    "selectAll": "Select all", "clearAll": "Clear", "notAvailable": "Not available for this destination",
    "platforms": { "facebook": "Facebook", "instagram": "Instagram", "messenger": "Messenger", "audience_network": "Audience Network" },
    "positions": {
      "facebook": { "feed": "Feed", "profile_feed": "Profile feed", "marketplace": "Marketplace", "video_feeds": "Video feeds", "right_hand_column": "Right column", "story": "Stories", "facebook_reels": "Reels", "instream_video": "In-stream videos", "search": "Search results" },
      "instagram": { "stream": "Feed", "profile_feed": "Profile feed", "explore": "Explore", "explore_home": "Explore home", "story": "Stories", "reels": "Reels", "ig_search": "Search results" },
      "messenger": { "messenger_home": "Inbox", "story": "Stories" },
      "audience_network": { "classic": "Native, banner and interstitial", "rewarded_video": "Rewarded videos" }
    }
  },
  "events": {
    "LEAD": "Lead", "COMPLETE_REGISTRATION": "Complete registration", "CONTACT": "Contact", "SUBMIT_APPLICATION": "Submit application", "SCHEDULE": "Schedule",
    "PURCHASE": "Purchase", "ADD_TO_CART": "Add to cart", "INITIATED_CHECKOUT": "Initiate checkout", "ADD_PAYMENT_INFO": "Add payment info", "SUBSCRIBE": "Subscribe",
    "START_TRIAL": "Start trial", "CONTENT_VIEW": "View content", "SEARCH": "Search", "FIND_LOCATION": "Find location", "DONATE": "Donate", "CUSTOMIZE_PRODUCT": "Customize product"
  },
  "ctas": {
    "LEARN_MORE": "Learn more", "SHOP_NOW": "Shop now", "SIGN_UP": "Sign up", "BOOK_TRAVEL": "Book now", "CONTACT_US": "Contact us", "GET_OFFER": "Get offer", "GET_QUOTE": "Get quote",
    "SUBSCRIBE": "Subscribe", "APPLY_NOW": "Apply now", "ORDER_NOW": "Order now", "DOWNLOAD": "Download", "WATCH_MORE": "Watch more", "MESSAGE_PAGE": "Send message",
    "WHATSAPP_MESSAGE": "Send WhatsApp message", "INSTAGRAM_MESSAGE": "Send Instagram message", "VIEW_INSTAGRAM_PROFILE": "View Instagram profile", "CALL_NOW": "Call now",
    "INSTALL_MOBILE_APP": "Install now", "USE_APP": "Use app", "PLAY_GAME": "Play game", "LIKE_PAGE": "Like Page", "EVENT_RSVP": "Interested", "NO_BUTTON": "No button"
  },
  "ads": {
    "apiPendingTitle": "Ads are saved in the draft for now", "apiPendingBody": "Creating ads on Meta is waiting for its API. Build them now: the campaign and ad sets are published, and these ads stay in the draft marked “waiting for API” until the connection is live.",
    "forAdSet": "Ads for ad set", "tabsLabel": "Ads", "add": "Add ad",
    "identityTitle": "Name and identity", "identityDescription": "Who the ad appears to come from.", "name": "Ad name", "namePlaceholder": "e.g. Offer – square image",
    "page": "Facebook Page", "sameAsCampaign": "Same as campaign Page", "instagram": "Instagram account", "useFacebookPage": "Use the Facebook Page",
    "formatTitle": "Format and media", "formatDescription": "How the ad looks.",
    "formats": {
      "single_image": { "title": "Single image", "description": "One image. 1080×1080 works everywhere." },
      "single_video": { "title": "Single video", "description": "One video. Vertical 9:16 is best for Stories and Reels." },
      "carousel": { "title": "Carousel", "description": "2–10 scrollable cards, each with its own image and headline." },
      "existing_post": { "title": "Existing post", "description": "Promote a post already on your Page." }
    },
    "image": "Image", "video": "Video", "fromLibrary": "Choose from library", "upload": "Upload", "localUploadPending": "Local file — will be uploaded when the media API is connected.",
    "libraryTitle": "Media library", "libraryDescription": "Images and videos in this ad account.", "libraryEmpty": "No media in this ad account yet.",
    "carouselCards": "Cards ({{count}}/{{max}})", "addCard": "Add card", "cardNumber": "Card {{count}}", "cardLink": "Card link", "cardLinkPlaceholder": "Card link (optional)",
    "carouselEmpty": "Add at least {{min}} cards.", "moveUp": "Move up", "moveDown": "Move down", "existingPost": "Page post",
    "textTitle": "Text", "textDescription": "Add variants — Meta shows each person the best one.",
    "primaryText": "Primary text", "primaryTextPlaceholder": "Tell people what you offer and why now…", "headline": "Headline", "headlinePlaceholder": "Short and clear, e.g. Free consultation",
    "description": "Description", "addVariant": "Add variant", "variantPlaceholder": "Variant {{count}}",
    "destinationTitle": "Button and destination", "callToAction": "Call-to-action button",
    "websiteUrl": "Website URL", "displayLink": "Display link", "urlParameters": "URL parameters", "addUtm": "Add UTM",
    "phoneNumber": "Phone number", "phoneHint": "International format, e.g. +201001234567."
  },
  "leadForm": {
    "title": "Instant form", "useExisting": "Use existing form", "createNew": "Create new form", "choosePageFirst": "Choose the Facebook Page in the campaign step to see its forms.",
    "noForms": "This Page has no forms yet — create a new one.", "archived": "Archived", "questionsCount": "{{count}} questions", "leadsCount": "{{count}} leads",
    "createPending": "The form is saved with the draft and created on Meta when the lead-form API is connected.",
    "name": "Form name", "nameHint": "Internal name, not shown to people.", "type": "Form type",
    "types": {
      "more_volume": { "title": "More volume", "description": "Quick to submit — more leads, lower cost." },
      "higher_intent": { "title": "Higher intent", "description": "Adds a review step so people confirm their details — fewer but better leads." }
    },
    "introHeadline": "Intro headline", "introDescription": "Intro text",
    "questions": "Questions", "questionsHint": "Name and phone are pre-filled from the person's profile. Fewer questions = more leads.",
    "questionTypes": { "FULL_NAME": "Full name", "PHONE": "Phone", "EMAIL": "Email", "CITY": "City", "STATE": "Governorate", "JOB_TITLE": "Job title", "COMPANY_NAME": "Company", "DATE_OF_BIRTH": "Date of birth", "GENDER": "Gender" },
    "customQuestions": "Custom questions", "addQuestion": "Add question", "questionPlaceholder": "Your question", "answerType": "Answer type", "short": "Short answer", "choice": "Multiple choice",
    "optionPlaceholder": "Option {{count}}", "addOption": "Add option",
    "privacyUrl": "Privacy policy link", "privacyText": "Link text",
    "thankYouTitle": "Completion screen", "thankYouHeadline": "Headline", "thankYouDescription": "Message", "thankYouButton": "Button",
    "thankYouButtons": { "VIEW_WEBSITE": "View website", "CALL_BUSINESS": "Call business", "DOWNLOAD": "Download", "NONE": "No button" },
    "thankYouWebsite": "Website link", "thankYouPhone": "Business phone"
  },
  "messaging": {
    "greeting": "Welcome message", "greetingPlaceholder": "Hi! Thanks for reaching out — how can we help?", "greetingHint": "Shown when the chat opens.",
    "iceBreakers": "Suggested questions", "addQuestion": "Add question", "questionPlaceholder": "Question {{count}}", "iceBreakersHint": "Up to 4 tap-to-send questions, e.g. “What are the prices?”"
  },
  "preview": {
    "title": "Preview", "feed": "Feed", "story": "Story", "sponsored": "Sponsored", "like": "Like", "comment": "Comment", "call": "Call",
    "primaryTextPlaceholder": "Your primary text appears here.", "headlinePlaceholder": "Your headline", "pageName": "Your Page",
    "chatTitle": "Chat opens with:", "disclaimer": "Approximate preview — the final look varies by placement."
  },
  "routing": {
    "team": "Assign leads to team", "useDefaultRules": "Use the assignment rules", "teamHint": "Leads from this campaign go to this team; leave empty to use your lead-assignment rules.",
    "status": "First status", "defaultStatus": "Default status", "tags": "Tags for these leads", "noTags": "No tags defined yet.",
    "note": "Note for the sales team", "notePlaceholder": "e.g. Mention the 20% October offer when calling."
  },
  "review": {
    "checklistTitle": "Readiness checklist", "checklistBlocking": "{{count}} item(s) must be fixed before publishing.", "checklistReady": "Everything required is complete.",
    "allGoodTitle": "Ready to publish", "allGoodBody": "No problems found. Review the summary and publish.",
    "summaryTitle": "Summary", "summaryDescription": "Everything that will be created. Click edit to change any part.",
    "campaign": "Campaign", "objective": "Objective", "budget": "Budget", "schedule": "Schedule", "adSetBudgets": "Set per ad set",
    "locations": "Locations", "excluding": "Excluding: {{list}}", "audience": "Audience", "advantageOn": "Advantage+ audience on", "ads": "Ads",
    "startsAt": "Starts {{time}}", "endsAt": "ends {{time}}",
    "routingTitle": "Lead handling in the CRM", "routingDescription": "What happens to leads from this campaign when they arrive.",
    "statusTitle": "After publishing", "statusDescription": "Choose whether ads start delivering immediately.",
    "publishStatus": {
      "PAUSED": { "title": "Create paused (recommended)", "description": "Everything is created but nothing spends until you activate it." },
      "ACTIVE": { "title": "Start delivering", "description": "Ads go to Meta review and start as soon as they're approved." }
    },
    "planTitle": "What will be created", "planDescription": "Published in this order. If a step fails you can resume from it."
  },
  "publish": {
    "publish": "Publish campaign", "resume": "Resume publishing", "retry": "Retry", "backToEdit": "Back to editing", "startNew": "New campaign", "openCampaign": "Open campaign",
    "dialogTitle": { "running": "Publishing to Meta…", "failed": "Publishing stopped", "done": "Campaign published", "partial": "Campaign published — ads waiting", "idle": "Publish" },
    "status": { "running": "Publishing", "partial": "Ads waiting", "failed": "Failed", "done": "Published" },
    "steps": { "campaign": "Campaign: {{name}}", "adSet": "Ad set: {{name}}", "ad": "Ad: {{name}}" },
    "pendingApi": "Waiting for the ads API — kept in the draft",
    "failedTitle": "Meta rejected a step", "failedBody": "Something went wrong while publishing.", "retryHint": "Fix the problem, then resume — steps already created won't be duplicated.",
    "errors": { "missingCampaignId": "The campaign was created but Meta didn't return its ID.", "missingAdSetId": "The ad set was created but Meta didn't return its ID.", "missingAdId": "The ad was created but Meta didn't return its ID." },
    "doneTitle": "Campaign published", "donePaused": "Everything was created paused. Activate it from the campaign page when you're ready.", "doneActive": "Ads were sent to Meta for review and will start when approved.",
    "partialTitle": "Campaign and ad sets published", "partialBody": "{{count}} ad(s) are saved in this draft and will be published when the ads API is connected.",
    "publishedBannerTitle": "This draft has been published", "publishedBannerBody": "Changes here won't update the live campaign. Duplicate it to launch a new variation.", "duplicateAsNew": "Duplicate as new"
  },
  "drafts": {
    "title": "Drafts", "description": "{{count}} saved in this browser", "new": "New campaign", "search": "Search drafts", "empty": "Your drafts appear here. Every change is saved automatically.",
    "noMatch": "No drafts match.", "untitled": "Untitled campaign", "noObjective": "No objective yet", "actions": "Draft actions", "duplicate": "Duplicate", "delete": "Delete",
    "deleteTitle": "Delete draft?", "deleteMessage": "“{{name}}” will be deleted from this browser. This can't be undone.", "copySuffix": " (copy)", "expand": "Show drafts", "collapse": "Hide drafts"
  },
  "guide": {
    "title": "Guide", "missingTitle": "Still needed ({{count}})", "checklistTitle": "Checklist", "stageComplete": "This step is complete.", "more": "+{{count}} more", "tipsTitle": "Tips",
    "fields": {
      "objective": { "title": "Campaign objective", "body": "The result Meta optimizes for. It decides which destinations and goals are available later." },
      "objectives": {
        "OUTCOME_AWARENESS": { "title": "Awareness", "body": "Cheapest reach. Use it for launches and brand recall — not for collecting leads." },
        "OUTCOME_TRAFFIC": { "title": "Traffic", "body": "Good for visits when you don't have conversion data yet. Choose Landing page views for better-quality visitors." },
        "OUTCOME_ENGAGEMENT": { "title": "Engagement", "body": "Includes WhatsApp and Messenger conversations — popular for businesses that close sales in chat." },
        "OUTCOME_LEADS": { "title": "Leads", "body": "The best objective for a CRM: instant forms send contact details straight into the system." },
        "OUTCOME_SALES": { "title": "Sales", "body": "Needs a Pixel or Conversions API sending purchase events, otherwise Meta can't optimize." },
        "OUTCOME_APP_PROMOTION": { "title": "App promotion", "body": "For installs and in-app actions; needs your app registered with Meta." }
      },
      "campaign": {
        "name": { "title": "Campaign name", "body": "Internal only. A good pattern: Objective – Product – Area – Month." },
        "pageId": { "title": "Facebook Page", "body": "Ads run from this Page; form leads and messages arrive on it and then into the CRM." },
        "specialAdCategories": { "title": "Special ad category", "body": "Declare it if the ad is about housing, jobs, loans/credit/insurance, or politics. Undeclared ads in these areas get rejected." },
        "specialAdCategoryCountries": { "title": "Countries", "body": "The countries where the special category rules apply — usually the same countries you target." },
        "budgetLevel": { "title": "Budget control", "body": "Advantage campaign budget suits most campaigns. Per-ad-set budgets are for strict tests where every audience must get equal spend." },
        "spendCap": { "title": "Spending limit", "body": "A safety ceiling for the whole campaign. It pauses delivery when reached; you can raise it later." }
      },
      "budget": {
        "amount": { "title": "Budget amount", "body": "In the ad account's currency. Give Meta enough budget for about 50 results per week per ad set to exit learning faster." },
        "bidStrategy": { "title": "Bid strategy", "body": "Highest volume is the safe default. Cost goals help control cost per lead but may spend less than the budget." },
        "cost_cap": { "title": "Cost per result goal", "body": "Set it close to your real average cost per lead; too low and the campaign barely spends." },
        "bid_cap": { "title": "Bid cap", "body": "The maximum bid in each auction. Only for advertisers who understand auction dynamics." },
        "minimum_roas": { "title": "Minimum ROAS", "body": "Return you require per unit spent, e.g. 3 = 3 of revenue for every 1 spent." }
      },
      "schedule": {
        "start": { "title": "Start date", "body": "In the ad account's time zone. Scheduling lets ads pass review before they start." },
        "end": { "title": "End date", "body": "Required for lifetime budgets. Offers with a deadline should end when the offer ends." },
        "dayparting": { "title": "Ad scheduling", "body": "Show ads only when your team can answer — useful for WhatsApp and call campaigns." }
      },
      "adSet": {
        "name": { "title": "Ad set name", "body": "Describe the audience, e.g. Cairo & Giza – 25-45." },
        "conversionLocation": { "title": "Conversion location", "body": "Where the result happens. For CRM leads: Instant form, WhatsApp or Messenger." },
        "performanceGoal": { "title": "Performance goal", "body": "What Meta counts as success when deciding who sees the ad." },
        "whatsappPhoneNumber": { "title": "WhatsApp number", "body": "Must be a WhatsApp Business number linked to the Facebook Page." },
        "instagramAccountId": { "title": "Instagram account", "body": "The professional Instagram account linked to the Page." },
        "pixelId": { "title": "Pixel", "body": "The tracking code on your website. Meta uses it to find people who convert." },
        "customEventType": { "title": "Conversion event", "body": "The exact action Meta optimizes for, e.g. Lead for a sign-up page." },
        "applicationId": { "title": "App", "body": "The app registered in your Meta business." },
        "objectStoreUrl": { "title": "Store link", "body": "Google Play or App Store link to the app." },
        "eventId": { "title": "Event", "body": "The Facebook event people will respond to." },
        "frequency": { "title": "Frequency cap", "body": "Limits how often the same person sees the ad. 2 per 7 days is a sensible start." },
        "placements": { "title": "Placements", "body": "Advantage+ placements usually lower cost. Manual placements suit creatives made for one format only." }
      },
      "audience": {
        "geo": { "title": "Locations", "body": "Search countries, governorates, cities or areas. Use Exclude to remove areas you don't serve, a radius around cities, or a pin for one branch." },
        "locationType": { "title": "Who counts as being there", "body": "“Living in or recently in” is broadest. Choose “Living in” when you deliver only to residents." },
        "age": { "title": "Age", "body": "Keep it broad unless your offer is age-specific. With Advantage+ audience it's a suggestion." }
      },
      "ad": {
        "name": { "title": "Ad name", "body": "Helps you compare ads in reports, e.g. Offer – video – v2." },
        "identity": { "title": "Identity", "body": "The Page and Instagram account shown as the ad's author." },
        "formats": {
          "single_image": { "title": "Single image", "body": "Fast to produce. Use 1080×1080 (1:1) or 1080×1350 (4:5)." },
          "single_video": { "title": "Single video", "body": "Hook viewers in the first 3 seconds; add captions for silent viewing." },
          "carousel": { "title": "Carousel", "body": "Show several products or steps; each card can have its own link." },
          "existing_post": { "title": "Existing post", "body": "Keeps the post's likes and comments — good social proof." }
        },
        "media": { "title": "Media", "body": "Use your own photos where possible; avoid heavy text on images." },
        "carousel": { "title": "Carousel cards", "body": "2–10 cards. Put the strongest card first." },
        "existingPost": { "title": "Page post", "body": "Only posts published on the selected Page can be promoted." },
        "primaryText": { "title": "Primary text", "body": "Lead with the benefit and the offer. Arabic, English or both — match your audience." },
        "headline": { "title": "Headline", "body": "Around 40 characters. Repeat the core offer." },
        "description": { "title": "Description", "body": "Extra detail shown in some placements only." },
        "callToAction": { "title": "Button", "body": "Pick the button that matches the next step, e.g. Send WhatsApp message." },
        "websiteUrl": { "title": "Website URL", "body": "Send people to the page that matches the ad, not just your homepage." },
        "displayLink": { "title": "Display link", "body": "A short, clean link shown instead of the full URL." },
        "urlParameters": { "title": "URL parameters", "body": "UTM tags let your analytics attribute visits and leads to this ad." },
        "phoneNumber": { "title": "Phone number", "body": "Make sure someone answers during the ad schedule." },
        "messageTemplate": { "title": "Chat start", "body": "A clear welcome message and quick questions raise the reply rate." },
        "adSetPicker": { "title": "Ad set", "body": "Each ad set has its own ads. Switch here to edit another ad set's ads." }
      },
      "leadForm": {
        "select": { "title": "Instant form", "body": "Choose a form with the questions your sales team needs — nothing more." },
        "name": { "title": "Form name", "body": "Internal name; include the offer and date for easy tracking." },
        "intro": { "title": "Intro", "body": "Say what people get after submitting, e.g. a callback within an hour." },
        "privacy": { "title": "Privacy policy", "body": "Meta requires a link to your privacy policy on every instant form." },
        "thankYou": { "title": "Completion screen", "body": "Tell people what happens next and give them a useful next step." }
      },
      "leadRouting": {
        "team": { "title": "Receiving team", "body": "Leads are assigned to this team as soon as they arrive, so response time stays short." },
        "status": { "title": "First status", "body": "The pipeline stage new leads start in." },
        "note": { "title": "Note", "body": "Context your sales team sees on every lead from this campaign." }
      }
    }
  },
  "issues": {
    "objectiveRequired": "Choose a campaign objective or a template.",
    "nameTooLong": "The name must be at most {{max}} characters.", "nameAutoGenerated": "No name entered — the suggested name will be used.",
    "pageRequired": "Choose the Facebook Page the ads will run from.", "pageUnavailable": "The selected Page is no longer connected — choose another.",
    "specialCountriesRequired": "Select the countries for the special ad category.", "politicalAuthorization": "Political ads need an authorized account and a “Paid for by” disclaimer in Meta.",
    "budgetRequired": "Enter a budget greater than zero.", "budgetBelowSuggested": "Below the suggested minimum of {{minimum}} {{currency}}/day — Meta may reject it or deliver slowly.",
    "bidAmountRequired": "Enter the target or maximum amount for this bid strategy.", "roasRequired": "Enter the minimum ROAS.", "spendCapBelowBudget": "The spending limit is lower than the budget.",
    "startTimeRequired": "Choose the start date and time.", "startInPast": "The start time is in the past.", "endTimeRequired": "Choose the end date and time.",
    "lifetimeEndRequired": "A lifetime budget needs an end date.", "endInPast": "The end time is in the past.", "endBeforeStart": "The end must be after the start.", "lifetimeTooShort": "Run lifetime budgets for at least 24 hours.",
    "adSetRequired": "Add at least one ad set.", "conversionLocationRequired": "Choose where results happen (conversion location).", "goalIncompatible": "This performance goal doesn't fit the objective — choose another.",
    "whatsappRequired": "Enter the WhatsApp business number.", "phoneInvalid": "Use international format, e.g. +201001234567.", "instagramRequired": "Choose the Instagram account.",
    "pixelRequired": "Choose the Pixel.", "eventRequired": "Choose the conversion event.", "appRequired": "Choose the app.", "storeUrlInvalid": "Enter a valid app store link.", "eventIdRequired": "Enter the Facebook event ID.",
    "frequencyRequired": "Set how often people can see the ad.",
    "geoNoLocation": "Add at least one location to include.", "geoIncludedAndExcluded": "This place is both included and excluded.", "geoExclusionOutside": "This exclusion isn't inside any included location, so it has no effect.",
    "geoRedundant": "Already covered by a broader included location.", "geoRadiusOutOfRange": "Radius must be between {{min}} and {{max}} km.",
    "ageInvalid": "Choose a valid age range.", "ageUnder18": "Ads to people under 18 have extra restrictions in many countries.",
    "specialNoExclusions": "Detailed exclusions aren't allowed with this special ad category.", "specialNoLookalike": "Lookalike audiences aren't allowed with this special ad category.", "specialNoZip": "Postal codes aren't allowed with this special ad category.",
    "placementsRequired": "Select at least one placement.", "placementsUnsupported": "Some selected platforms don't support this destination.", "devicesRequired": "Select at least one device.",
    "daypartingNeedsLifetime": "Ad scheduling needs a lifetime budget.", "daypartingNoDays": "Select at least one day.", "daypartingHours": "The end hour must be after the start hour.",
    "adsApiPending": "Ads are saved in the draft until the ads API is connected.", "adRequired": "Add at least one ad to this ad set.",
    "existingPostRequired": "Choose the post to promote.", "carouselMinCards": "A carousel needs at least {{min}} cards.", "carouselCardMedia": "Every card needs an image or video.",
    "mediaRequired": "Add an image or video.", "videoRequired": "Choose a video for the video format.", "videoGoalNeedsVideo": "This performance goal needs a video ad.",
    "primaryTextRequired": "Write the primary text.", "primaryTextLong": "Longer than {{max}} characters — it will be cut off in most placements.",
    "headlineLong": "Longer than {{max}} characters — it may be cut off.", "headlineRecommended": "Adding a headline usually improves results.",
    "ctaInvalid": "Choose a button that fits this destination.", "websiteUrlRequired": "Enter the website URL.", "websiteUrlInvalid": "Enter a valid link starting with https://",
    "leadFormRequired": "Choose an instant form or create a new one.", "leadFormNameRequired": "Name the new form.", "leadFormQuestionsRequired": "Add at least one question.",
    "leadFormPhoneRecommended": "No phone question — your sales team won't be able to call these leads.", "leadFormCustomQuestionIncomplete": "Complete the custom questions (text, and at least 2 options for multiple choice).",
    "leadFormPrivacyRequired": "Add your privacy policy link (required by Meta).", "phoneRequired": "Enter the phone number.", "greetingRecommended": "A welcome message helps people start the chat.",
    "leadRoutingRecommended": "Choose which team receives these leads, or your assignment rules will be used."
  }
}
