export default {
  "login": "Sign in",
  "username": "Username",
  "usernameOrEmail": "Username or email",
  "usernamePlaceholder": "name@company.com",
  "password": "Password",
  "passwordPlaceholder": "Enter your password",
  "showPassword": "Show password",
  "hidePassword": "Hide password",
  "capsLockOn": "Caps Lock is on",
  "loginButton": "Sign in",
  "loggingIn": "Signing in...",
  "loginError": "Incorrect username or password",
  "welcomeBack": "Welcome back",
  "welcomeSubtitle": "Sign in to pick up where you left off",
  "tenantLabel": "Signing in to the {{tenant}} workspace",
  "orContinueWith": "or sign in with",
  "comingSoon": "Soon",
  "backToPassword": "Back to password",
  "methods": {
    "google": "Google",
    "faceId": "Face ID",
    "fingerprint": "Fingerprint"
  },
  "validation": {
    "loginRequired": "Enter your username or email",
    "passwordRequired": "Enter your password"
  },
  "errors": {
    "invalidCredentials": "Incorrect username or password. Check them and try again.",
    "accountDisabled": "This account is disabled. Ask your company admin to reactivate it.",
    "accountLocked": "This account is temporarily locked after failed attempts. Try later or contact your admin.",
    "tenantNotFound": "This workspace doesn't exist. Check your company's link.",
    "tooManyAttempts": "Too many sign-in attempts. Wait a moment and try again.",
    "tooManyAttemptsWait": "Too many sign-in attempts. Try again in {{seconds}} seconds.",
    "offline": "You're offline. Check your connection and try again.",
    "network": "Can't reach the server. Check your connection and try again.",
    "server": "The server ran into a problem. Try again shortly.",
    "unknown": "Couldn't sign you in. Try again."
  },
  "google": {
    "completing": "Finishing Google sign-in..."
  },
  "biometric": {
    "faceTitle": "Sign in with Face ID",
    "faceHint": "Look at the camera when your device asks.",
    "fingerprintTitle": "Sign in with fingerprint",
    "fingerprintHint": "Touch the fingerprint sensor when your device asks.",
    "startFace": "Verify with Face ID",
    "startFingerprint": "Verify with fingerprint",
    "waiting": "Waiting for verification...",
    "retryFace": "Try Face ID again",
    "retryFingerprint": "Try fingerprint again",
    "cancelled": "Verification was cancelled. Enter your PIN instead.",
    "failed": "We couldn't verify you. Enter your PIN to continue.",
    "deviceNotSupported": "This device doesn't support fingerprint or Face ID. Enter your PIN."
  },
  "pin": {
    "title": "Enter your PIN",
    "hint": "Enter your {{count}}-digit PIN.",
    "label": "PIN",
    "digit": "Digit {{index}} of {{total}}",
    "useInstead": "Use your PIN instead"
  },
  "showcase": {
    "label": "Tour of the system",
    "roledescription": "carousel",
    "slideRoledescription": "slide",
    "slideOf": "{{index}} of {{total}}",
    "chooseSlide": "Choose a slide",
    "previous": "Previous slide",
    "next": "Next slide",
    "pause": "Pause auto-play",
    "play": "Play auto-play",
    "slides": {
      "overview": {
        "area": "ICAN CRM",
        "title": "Every customer, every channel, one place",
        "subtitle": "Follow up on leads, reply on WhatsApp and Messenger, and route customers to your team from one screen.",
        "points": {
          "leads": {
            "title": "Leads center",
            "text": "Every prospect from every source lands in one list."
          },
          "inbox": {
            "title": "Unified inbox",
            "text": "WhatsApp, Messenger and Gmail in one thread per customer."
          },
          "teams": {
            "title": "Sales teams",
            "text": "Share the work across teams and see how each person performs."
          },
          "reports": {
            "title": "Ready-made reports",
            "text": "Every area's numbers on one reports page."
          }
        }
      },
      "customers": {
        "area": "Customer management",
        "title": "From the first message to the sale",
        "subtitle": "A full record for every customer: details, conversations, calls and proposals, with a clear pipeline stage.",
        "points": {
          "pipeline": {
            "title": "Sales pipeline",
            "text": "New, contacted, qualified, proposal, then won or lost."
          },
          "segments": {
            "title": "Tags and segments",
            "text": "Group customers by interest, source and priority."
          },
          "duplicates": {
            "title": "Duplicate detection",
            "text": "Find and merge duplicate customers before the team splits effort."
          },
          "import": {
            "title": "Import and export",
            "text": "Move your data in and out of Excel in a few steps."
          }
        }
      },
      "teams": {
        "area": "Teams and routing",
        "title": "Every lead reaches the right person, instantly",
        "subtitle": "Automatic assignment rules pick the right teammate for each customer, so no lead is forgotten.",
        "points": {
          "rules": {
            "title": "Assignment rules",
            "text": "By source, region, interest or customer priority."
          },
          "balance": {
            "title": "Load balancing",
            "text": "Leads are shared by each person's current workload."
          },
          "managers": {
            "title": "Managers and teams",
            "text": "Each team has a manager who follows its members and leads."
          },
          "myWork": {
            "title": "My Work",
            "text": "Everyone sees the tasks and follow-ups due today."
          }
        }
      },
      "calls": {
        "area": "Calls and meetings",
        "title": "Your calls and meetings on one calendar",
        "subtitle": "Schedule calls and meetings with each customer, and write a report after each one so the whole team knows where things stand.",
        "points": {
          "schedule": {
            "title": "Call scheduling",
            "text": "Set the call time and link it to the customer."
          },
          "meetings": {
            "title": "Meetings",
            "text": "In-person or online, with details and attendees."
          },
          "reports": {
            "title": "Report after each meeting",
            "text": "The outcome and next step are saved on the customer record."
          },
          "reminders": {
            "title": "Reminders and tasks",
            "text": "Never miss a follow-up, thanks to tasks and alerts."
          }
        }
      },
      "conversations": {
        "area": "Conversations",
        "title": "Reply on every channel without leaving the CRM",
        "subtitle": "WhatsApp, Messenger and Gmail messages arrive in real time, and any conversation can be handed to a teammate.",
        "points": {
          "whatsapp": {
            "title": "WhatsApp",
            "text": "Reply to customers and send approved message templates."
          },
          "messenger": {
            "title": "Messenger",
            "text": "Your Facebook page's messages in the same inbox."
          },
          "gmail": {
            "title": "Gmail",
            "text": "Email threads linked to the customer record."
          },
          "realtime": {
            "title": "Real time, together",
            "text": "New messages appear instantly, with internal team chat alongside."
          }
        }
      },
      "campaigns": {
        "area": "Ad campaigns",
        "title": "From ad to lead, with no copy-paste",
        "subtitle": "Create Facebook and Instagram campaigns inside the CRM; every lead arrives linked to the campaign and ad that brought it.",
        "points": {
          "meta": {
            "title": "Meta campaigns",
            "text": "Campaign, ad set and ad, step by step."
          },
          "leadForms": {
            "title": "Lead forms",
            "text": "Responses arrive as leads ready to route to the team."
          },
          "outreach": {
            "title": "Message campaigns",
            "text": "Send bulk messages to segments of your customers."
          },
          "cost": {
            "title": "Cost per lead",
            "text": "See which ad brought more leads for less."
          }
        }
      },
      "automation": {
        "area": "Automation and reports",
        "title": "Let the system do the routine work",
        "subtitle": "Automation for repeated tasks, proposals and deals, and reports that show where the opportunities and delays are.",
        "points": {
          "workflows": {
            "title": "Automated workflows",
            "text": "When something happens, the right action runs on its own."
          },
          "proposals": {
            "title": "Proposals",
            "text": "Build a proposal from a template and track its versions and status."
          },
          "deals": {
            "title": "Deals and opportunities",
            "text": "Follow every deal until it closes."
          },
          "analytics": {
            "title": "Reports and statistics",
            "text": "Conversion rate, response time and each person's performance."
          }
        }
      }
    }
  }
}
