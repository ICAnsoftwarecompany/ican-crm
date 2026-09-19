export default {
  "status": {
    "scheduled": "Scheduled",
    "in_progress": "In Progress",
    "completed": "Completed",
    "cancelled": "Cancelled"
  },
  "priority": {
    "urgent": "Urgent",
    "high": "High",
    "medium": "Medium",
    "low": "Low"
  },
  "type": {
    "meeting": "Meeting",
    "call": "Call"
  },
  "duration": {
    "and": " and ",
    "day": "{{count}} day",
    "hour": "{{count}} hour",
    "minute": "{{count}} minute",
    "second": "{{count}} second",
    "lessThanMinute": "Less than a minute",
    "remaining": "Remaining {{value}}",
    "overdueSince": "Overdue by {{hours}}h",
    "inProgressSince": "In progress for {{value}}",
    "inProgressNow": "Activity in progress now",
    "elapsedTime": "Elapsed time: {{value}}"
  },
  "preMeetingReport": {
    "title": "Pre-meeting Report",
    "meetingNumberLabel": "Meeting #{{id}}",
    "linkedMeetingLabel": "Linked meeting: {{title}}",
    "untitled": "Untitled",
    "chooseTemplateTitle": "Choose a preparation template",
    "chooseTemplateHint": "You can preview a template first, then apply it to the report.",
    "categoryRealEstate": "Real Estate",
    "categoryGeneral": "General template",
    "previewTemplate": "Preview Template",
    "applyTemplate": "Apply Template",
    "previewPrefix": "Preview: {{title}}",
    "previewFieldsHint": "The fields this report will contain",
    "optionsLabel": "Options: {{options}}",
    "applyThisTemplate": "Apply This Template",
    "noTemplateAppliedTitle": "No template applied yet",
    "noTemplateAppliedHint": "Choose a template above, then preview or apply it.",
    "cancel": "Cancel",
    "saveReport": "Save Report",
    "chooseTemplateFirst": "Choose a template first.",
    "noMeetingIdError": "No meeting number to attach the report to.",
    "applyTemplateFirst": "Choose and apply a report template first.",
    "completeFieldError": "Complete the field: {{field}}",
    "savedToast": "Pre-meeting report saved.",
    "options": {
      "apartment": "Apartment",
      "villa": "Villa",
      "townhouse": "Townhouse",
      "duplex": "Duplex",
      "chalet": "Chalet",
      "office": "Office",
      "officeAdmin": "Administrative Office",
      "shop": "Shop",
      "commercialShop": "Commercial Shop",
      "land": "Land",
      "other": "Other",
      "unspecified": "Unspecified",
      "residential": "Residential",
      "investment": "Investment",
      "commercial": "Commercial",
      "administrative": "Administrative",
      "resale": "Resale",
      "cash": "Cash",
      "installment": "Installment",
      "cashOrInstallment": "Cash or Installment",
      "trySystem": "Try the system",
      "sendQuote": "Send a quote",
      "anotherMeeting": "Another meeting",
      "startNegotiation": "Start negotiation",
      "closeDeal": "Close the deal"
    },
    "templates": {
      "realEstateDiscovery": {
        "title": "Real Estate Client Discovery",
        "description": "Suitable for a first meeting with a client interested in buying or renting property.",
        "fields": {
          "meetingObjective": { "label": "Meeting Objective", "placeholder": "What is the main objective of the meeting?" },
          "propertyType": { "label": "Required Property Type" },
          "preferredLocation": { "label": "Preferred Area", "placeholder": "e.g. Fifth Settlement" },
          "expectedBudget": { "label": "Expected Budget", "placeholder": "e.g. 5 to 7 million" },
          "purchasePurpose": { "label": "Purpose of Property" },
          "paymentMethod": { "label": "Preferred Payment Method" },
          "decisionMaker": { "label": "Decision Maker", "placeholder": "Who makes the purchase decision?" },
          "questionsToAsk": { "label": "Questions to Ask", "placeholder": "Write the key questions to discuss..." }
        }
      },
      "propertyRequirements": {
        "title": "Property Requirements",
        "description": "For gathering the client's needs in detail before recommending suitable units.",
        "fields": {
          "propertyType": { "label": "Unit Type" },
          "preferredProjects": { "label": "Preferred Projects or Areas", "placeholder": "List the projects or areas the client prefers." },
          "areaRequirement": { "label": "Required Area", "placeholder": "e.g. 150 to 200 sqm" },
          "bedrooms": { "label": "Number of Rooms" },
          "deliveryDate": { "label": "Preferred Delivery Date", "placeholder": "Immediate / a year / two years / unspecified" },
          "budget": { "label": "Budget" },
          "downPayment": { "label": "Preferred Down Payment" },
          "installmentPeriod": { "label": "Required Installment Period" },
          "mustHaveFeatures": { "label": "Must-Have Features", "placeholder": "Garden, specific floor, view, finishing, parking..." }
        }
      },
      "realEstateNegotiation": {
        "title": "Real Estate Negotiation & Closing",
        "description": "Suitable for advanced meetings after recommending a unit or presenting an offer.",
        "fields": {
          "meetingObjective": { "label": "Meeting Objective" },
          "selectedProperty": { "label": "Unit or Project Under Negotiation" },
          "offeredPrice": { "label": "Current Price" },
          "customerBudget": { "label": "Client Budget" },
          "customerObjections": { "label": "Client's Previous Objections" },
          "negotiationPoints": { "label": "Negotiation Points", "placeholder": "Price, down payment, installment years, delivery..." },
          "decisionMaker": { "label": "Decision Maker" },
          "expectedCloseDate": { "label": "Expected Closing Date" },
          "closingStrategy": { "label": "Deal Closing Plan" }
        }
      },
      "generalSales": {
        "title": "General Sales Meeting",
        "description": "A general template for any sales or follow-up meeting with the client.",
        "fields": {
          "meetingObjective": { "label": "Meeting Objective" },
          "customerNeeds": { "label": "Client Needs" },
          "customerProblems": { "label": "Current Problems" },
          "interestedProducts": { "label": "Products or Services of Interest" },
          "expectedBudget": { "label": "Expected Budget" },
          "decisionMaker": { "label": "Decision Maker" },
          "objections": { "label": "Expected Objections" },
          "questionsToAsk": { "label": "Questions to Ask" },
          "desiredNextStep": { "label": "Target Next Step After the Meeting" }
        }
      },
      "demoPresentation": {
        "title": "Demo / Presentation",
        "description": "Suitable for a product/service presentation meeting or a client demo.",
        "fields": {
          "demoGoal": { "label": "Demo Objective" },
          "currentSolution": { "label": "Currently Used Solution or System" },
          "currentProblems": { "label": "Current Problems" },
          "featuresToShow": { "label": "Points or Features to Show" },
          "customerPriorities": { "label": "Client Priorities" },
          "expectedQuestions": { "label": "Expected Questions" },
          "decisionMaker": { "label": "Decision Maker" },
          "budget": { "label": "Expected Budget" },
          "targetNextStep": { "label": "Target Outcome" }
        }
      }
    }
  },
  "meetingDrawer": {
    "live": "Live",
    "loadingMeeting": "Loading meeting data...",
    "start": "Start",
    "finish": "Finish",
    "elapsedSinceStart": "Time since start: {{value}}",
    "afterMeetingReportLabel": "After-meeting report",
    "available": "{{count}} available",
    "notAvailable": "Not available",
    "importantContentAlert": "Alert",
    "importantContentTitle": "Contains important content",
    "itemFallback": "Item",
    "openPage": "Open Page",
    "lockAction": "Lock",
    "unlockAction": "Unlock",
    "back": "Back",
    "previewReportTitle": "Preview Report",
    "detailsTitlePrefix": "{{type}} Details",
    "scheduleNumberFallback": "Schedule #{{id}}",
    "noParticipants": "No participants.",
    "noNotes": "No notes.",
    "noAttachments": "No attachments.",
    "noReportContent": "No text content for the report.",
    "reportFallback": "Report",
    "untitledReport": "Untitled report",
    "byPrefix": "By {{name}} - {{date}}",
    "viewReport": "View Report",
    "addPreReport": "Add pre-meeting report",
    "addAfterReport": "Add after-meeting report",
    "noReportsYet": "No reports.",
    "attachmentFallback": "Attachment",
    "meetingFinished": "Meeting finished successfully.",
    "meetingStarted": "Meeting started.",
    "meetingCancelled": "Meeting cancelled.",
    "tabs": {
      "overview": "Overview",
      "timing": "Timing",
      "participants": "Participants",
      "notes": "Notes",
      "attachments": "Attachments",
      "reports": "Reports",
      "call": "Call Data"
    },
    "sections": {
      "basicData": "Basic Data",
      "meetingCreator": "Meeting Creator",
      "linkedCustomer": "Linked Customer/Entity",
      "timing": "Timing",
      "reminders": "Reminders",
      "callData": "Call Data",
      "participantsTitle": "Participants ({{count}})",
      "reportsTitle": "Reports ({{count}})",
      "notesTitle": "Notes ({{count}})",
      "attachmentsTitle": "Attachments ({{count}})"
    },
    "fields": {
      "mode": "Mode",
      "scope": "Scope",
      "meetingLink": "Meeting Link",
      "location": "Location",
      "longitude": "Longitude",
      "latitude": "Latitude",
      "source": "Source",
      "callProvider": "Call Provider",
      "callerNumber": "Caller Number",
      "calleeNumber": "Callee Number",
      "callStatus": "Call Status",
      "callDurationSeconds": "Call Duration (seconds)",
      "externalCallId": "External Call ID",
      "recordingUrl": "Recording URL",
      "link": "Link",
      "outcome": "Outcome",
      "nextAction": "Next Action",
      "rating": "Rating",
      "updatedAt": "Updated At",
      "startAt": "Start Time",
      "endAt": "End Time",
      "actualStart": "Actual Start",
      "actualEnd": "Actual End",
      "elapsedTime": "Elapsed Time",
      "reminderType": "Reminder Type",
      "reminderBefore": "Before",
      "reminderUnit": "Unit",
      "reminderSentAt": "Reminder Sent At",
      "noteFallback": "Note without text"
    },
    "countdown": {
      "startsIn": "Starts in {{value}}",
      "overdue": "Overdue by {{value}}"
    }
  },
  "scheduleDialog": {
    "call": {
      "modalTitle": "Add Call Appointment",
      "description": "Enter the call details and it will be saved as an appointment linked to the customer or lead.",
      "titleLabel": "Call Title",
      "titlePlaceholder": "e.g. Follow up on offer",
      "notesLabel": "Description or Notes",
      "notesPlaceholder": "Write call details or follow-up reason...",
      "defaultTitle": "Call with",
      "successMessage": "Call appointment created.",
      "actionTitle": "call appointment",
      "saveLabel": "Save Call Appointment",
      "updateLabel": "Update Call Appointment"
    },
    "meeting": {
      "modalTitle": "Add Meeting Appointment",
      "description": "Enter the meeting details and it will be saved as an appointment linked to the customer or lead.",
      "titleLabel": "Meeting Title",
      "titlePlaceholder": "e.g. Follow-up meeting on offer",
      "notesLabel": "Description or Notes",
      "notesPlaceholder": "Write meeting details or follow-up points...",
      "defaultTitle": "Meeting with",
      "successMessage": "Meeting appointment created.",
      "actionTitle": "meeting appointment",
      "saveLabel": "Save Meeting Appointment",
      "updateLabel": "Update Meeting Appointment"
    },
    "priorityOptions": {
      "low": "Low",
      "medium": "Medium",
      "high": "High",
      "urgent": "Urgent"
    },
    "reminderOptions": {
      "system": "System",
      "email": "Email"
    },
    "editPrefix": "Edit {{action}}",
    "customerLabel": "Customer",
    "customerFallback": "the customer",
    "linkEntityTitle": "Link Appointment",
    "entityTypeLabel": "Entity Type",
    "entityIdLabel": "Entity ID",
    "entityIdPlaceholder": "Enter ID",
    "appointmentDataTitle": "Appointment Data",
    "priorityLabel": "Priority",
    "startLabel": "Start Time",
    "endLabel": "End Time",
    "callSettingsTitle": "Call Settings",
    "meetingModeTitle": "Meeting Method",
    "callModeLabel": "Call Method",
    "meetingModeLabel": "Meeting Method",
    "callProviderLabel": "Call Provider",
    "callerNumberLabel": "Caller Number",
    "calleeNumberLabel": "Customer Number",
    "optionalPlaceholder": "Optional",
    "callLinkLabel": "Call Link",
    "meetingLinkLabel": "Meeting Link",
    "callLocationLabel": "In-person Call Address",
    "meetingLocationLabel": "Meeting Address",
    "addressPlaceholder": "Enter the address",
    "participantsScopeTitle": "Participants & Scope",
    "scopeLabel": "Scope",
    "teamLabel": "Team",
    "chooseTeamPlaceholder": "Choose team",
    "participatingUsersLabel": "Participating Users",
    "chooseUsersButton": "Choose Users",
    "participantsCountLabel": "Participants:",
    "noParticipantsSelected": "No participants selected yet.",
    "remindersTitle": "Reminder",
    "reminderUnitLabel": "Unit",
    "reminderCountLabel": "Count",
    "minutesOption": "Minutes",
    "hoursOption": "Hours",
    "daysOption": "Days",
    "attachmentsTitle": "Attachments",
    "filesTabLabel": "Files",
    "voiceNoteTabLabel": "Voice note",
    "recordingInProgress": "Recording ({{seconds}}s)",
    "recordVoiceNote": "Record voice note",
    "stopRecording": "Stop Recording",
    "recordButton": "Record",
    "preMeetingSectionTitle": "Before the Meeting",
    "openPreMeetingAfterSave": "Open pre-meeting report after saving",
    "linkedToEntity": "This appointment will be linked to #{{id}}",
    "chooseParticipantsTitle": "Choose Participating Users",
    "chooseParticipantsDesc": "Search and select the users participating in this appointment",
    "done": "Done",
    "searchUserPlaceholder": "Search for a user...",
    "noMatchingUser": "No matching user found.",
    "micNotSupported": "Your browser does not support voice note recording here.",
    "micPermissionError": "Could not access the microphone. Make sure to allow permission.",
    "noEntityLinkedError": "No Lead or Customer linked to this appointment.",
    "chooseStartEndError": "Choose a start and end for the {{action}}.",
    "chooseParticipantError": "Choose at least one participant.",
    "chooseTeamError": "Choose the responsible team.",
    "updatedToast": "Appointment updated.",
    "preMeetingReportPendingError": "The meeting was saved, but no meeting number was received to open the pre-meeting report."
  },
  "afterMeetingReport": {
    "categoryRealEstate": "Real Estate",
    "categoryGeneral": "General",
    "additionalNotesLabel": "Additional Notes",
    "drawerDescription": "Choose the template that fits the meeting type, then preview it before recording the outcome.",
    "closeConfirm": "You have unsaved content in the after-meeting report. Do you want to close the drawer?",
    "changeTemplateConfirm": "Changing the template will clear the data you entered. Do you want to continue?",
    "savedToast": "After-meeting report saved.",
    "elapsedDurationLabel": "Elapsed time: {{value}}",
    "chooseResultTemplateTitle": "Choose a template to record the outcome",
    "templateHint": "The template turns your answers into a clear report saved in the report notes.",
    "documentFormatTitle": "Report Format (Document Style)",
    "documentFormatHint": "Each heading has an edit button next to it — write the new text, then press save.",
    "mainHeaderLabel": "Main Header",
    "mainHeaderPlaceholder": "e.g. After-meeting Report",
    "templateTitleLabel": "Template Title",
    "templateTitlePlaceholder": "Enter the template title",
    "headerSubtitleLabel": "Header Description/Intro",
    "headerSubtitlePlaceholder": "Write the report intro",
    "editFieldTitlesSummary": "Edit Field Titles",
    "fieldTitlePlaceholder": "Field title",
    "templateLine": "Template: {{value}}",
    "meetingLine": "Meeting: {{value}}",
    "usedTemplateLabel": "Template used: {{value}}",
    "fieldsCountSuffix": "{{count}} fields",
    "chooseOption": "Choose",
    "options": {
      "interestLevel": {
        "veryHigh": "Very High",
        "high": "High",
        "medium": "Medium",
        "low": "Low",
        "notInterested": "Not Interested"
      }
    },
    "templates": {
      "realEstateDiscoveryResult": {
        "title": "Real Estate Discovery Meeting Result",
        "description": "Suitable for documenting a first meeting with a real estate client after learning their needs.",
        "fields": {
          "meetingSummary": { "label": "Meeting Summary" },
          "confirmedPropertyType": {
            "label": "Confirmed Property Type",
            "options": { "0": "Apartment", "1": "Villa", "2": "Townhouse", "3": "Duplex", "4": "Chalet", "5": "Administrative Office", "6": "Commercial Shop", "7": "Land", "8": "Unspecified" }
          },
          "confirmedLocation": { "label": "Suitable Areas or Projects" },
          "confirmedBudget": { "label": "Confirmed Budget" },
          "paymentPreference": {
            "label": "Suitable Payment Method",
            "options": { "0": "Cash", "1": "Installment", "2": "Cash or Installment", "3": "Unspecified" }
          },
          "customerInterestLevel": { "label": "Client Interest Level" },
          "customerObjections": { "label": "Client Objections" },
          "decisionMaker": { "label": "Decision Maker" },
          "informationNeeded": { "label": "Information or Details Requested by Client" },
          "nextStep": { "label": "Agreed Next Step" }
        }
      },
      "propertyPresentationResult": {
        "title": "Property Units Presentation Result",
        "description": "Suitable after presenting a project or a set of units to the client.",
        "fields": {
          "meetingSummary": { "label": "Meeting Summary" },
          "propertiesPresented": { "label": "Units or Projects Presented" },
          "preferredProperty": { "label": "Client's Preferred Unit or Project" },
          "customerFeedback": { "label": "Client's Feedback on the Units Presented" },
          "preferredFeatures": { "label": "Features the Client Liked" },
          "rejectedFeatures": { "label": "Points That Did Not Suit the Client" },
          "priceFeedback": { "label": "Client's Feedback on the Price" },
          "paymentFeedback": { "label": "Client's Feedback on the Payment Plan" },
          "customerObjections": { "label": "Main Objections" },
          "followUpRequirement": { "label": "Requirements Before the Next Follow-up" },
          "nextStep": {
            "label": "Next Step",
            "options": { "0": "Send additional units", "1": "Send price details", "2": "Arrange a viewing", "3": "Negotiate the price", "4": "Preliminary booking", "5": "Follow-up meeting", "6": "No follow-up currently" }
          }
        }
      },
      "realEstateNegotiationResult": {
        "title": "Real Estate Negotiation Result",
        "description": "Suitable after a negotiation meeting or an attempt to close a real estate deal.",
        "fields": {
          "meetingSummary": { "label": "Meeting Summary" },
          "property": { "label": "Unit or Project Under Negotiation" },
          "initialPrice": { "label": "Price Before Negotiation" },
          "negotiatedPrice": { "label": "Price After Negotiation" },
          "agreedDownPayment": { "label": "Agreed Down Payment" },
          "agreedInstallmentPeriod": { "label": "Agreed Installment Period" },
          "customerObjections": { "label": "Client Objections" },
          "concessionsOffered": { "label": "Concessions Offered" },
          "dealStatus": {
            "label": "Deal Status",
            "options": { "0": "Agreed", "1": "Preliminary approval", "2": "Needs partner approval", "3": "Needs management approval", "4": "Needs time to think", "5": "Negotiation ongoing", "6": "Deal rejected", "7": "Deal closed" }
          },
          "expectedCloseDate": { "label": "Expected Closing Date" },
          "nextStep": { "label": "Next Step" }
        }
      },
      "generalSalesResult": {
        "title": "General Sales Meeting Result",
        "description": "A general template for documenting sales and follow-up meeting results.",
        "fields": {
          "meetingSummary": { "label": "Meeting Summary" },
          "customerNeeds": { "label": "Needs Confirmed by the Client" },
          "customerFeedback": { "label": "Client's Feedback" },
          "interestedProducts": { "label": "Products or Services of Interest" },
          "customerObjections": { "label": "Client Objections" },
          "budgetDiscussed": { "label": "Budget Discussed" },
          "decisionMaker": { "label": "Decision Maker" },
          "decisionTimeline": { "label": "Expected Decision Date" },
          "dealProbability": {
            "label": "Deal Closing Probability",
            "options": { "0": "Very High", "1": "High", "2": "Medium", "3": "Low", "4": "Unexpected" }
          },
          "nextStep": {
            "label": "Next Step",
            "options": { "0": "Follow-up call", "1": "Follow-up meeting", "2": "Send a quote", "3": "Send information", "4": "Send Proposal", "5": "Trial / Demo", "6": "Start negotiation", "7": "Close the deal", "8": "No follow-up" }
          },
          "followUpDate": { "label": "Follow-up Date" }
        }
      },
      "demoPresentationResult": {
        "title": "Demo / Presentation Result",
        "description": "Suitable after presenting a product, service, or demo to the client.",
        "fields": {
          "meetingSummary": { "label": "Meeting Summary" },
          "featuresPresented": { "label": "Features Presented" },
          "customerLiked": { "label": "Features the Client Liked" },
          "customerConcerns": { "label": "Concerns or Objections" },
          "questionsAsked": { "label": "Questions Raised by the Client" },
          "missingRequirements": { "label": "Missing Requirements or Needed Additions" },
          "customerInterestLevel": { "label": "Client Interest Level" },
          "proposalRequested": {
            "label": "Did the client request a quote?",
            "options": { "0": "Yes", "1": "No", "2": "To be determined later" }
          },
          "trialRequested": {
            "label": "Did the client request a trial?",
            "options": { "0": "Yes", "1": "No", "2": "Not available" }
          },
          "nextStep": {
            "label": "Next Step",
            "options": { "0": "Send a quote", "1": "Send Proposal", "2": "Send additional information", "3": "Trial", "4": "Technical meeting", "5": "Negotiation meeting", "6": "Later follow-up", "7": "Close the deal", "8": "None" }
          },
          "followUpDate": { "label": "Follow-up Date" }
        }
      }
    }
  },
  "table": {
    "type": "Type",
    "relatedLeadCustomer": "Lead / Customer",
    "customerEmail": "Email",
    "customerCompany": "Company",
    "customerAgent": "Agent",
    "status": "Status",
    "customerLeadStatus": "Client Status",
    "title": "Activity",
    "assigned": "Assigned To",
    "startAt": "Start",
    "endAt": "End / Duration",
    "report": "Report",
    "actions": "Actions",
    "openCustomerTitle": "Open customer",
    "elapsedTimePrefix": "Elapsed {{value}}",
    "reportPresent": "Present",
    "reportMissing": "Missing",
    "sinceLabel": "Since {{value}}",
    "remainingLabel": "Remaining {{value}}",
    "overdueLabel": "Overdue {{value}}",
    "emptyMessage": "No matching calls or meetings found."
  },
  "report": {
    "noReportSaved": "No report saved for this activity yet."
  },
  "page": {
    "startedCall": "Call started.",
    "startedMeeting": "Meeting started.",
    "startFailed": "Could not start the activity",
    "cancelConfirm": "Do you want to cancel this activity?",
    "cancelledToast": "Activity cancelled.",
    "cancelFailed": "Could not cancel the activity",
    "deleteConfirm": "Do you want to permanently delete this activity?",
    "deletedToast": "Activity deleted.",
    "deleteFailed": "Could not delete the activity",
    "followUpTitlePrefix": "Follow-up - {{title}}",
    "finishMeetingFailed": "Could not finish the meeting",
    "callLabel": "the call",
    "meetingLabel": "the meeting",
    "openDetails": "Open {{label}} details",
    "pageActionsSection": "Page Actions",
    "addNewMeeting": "Add New Meeting",
    "meetingActionsSection": "Meeting Actions",
    "startLabel": "Start {{label}}",
    "cancelLabel": "Cancel {{label}}",
    "finishLabel": "Finish {{label}}",
    "loadingActivities": "Loading activities...",
    "noMatchingResultsTitle": "No matching results",
    "noActivitiesYetTitle": "No calls or meetings yet",
    "changeFiltersDesc": "Change or clear the filters to see other activities.",
    "createFirstActivityDesc": "Create your first activity to manage customer follow-up in one place."
  },
  "reportDialog": {
    "title": "Finish Activity & Add Report",
    "description": "Record the call or meeting outcome and clearly set the next action.",
    "followUpDescription": "Follow-up resulting from {{title}}",
    "savedToast": "Report saved and activity finished.",
    "saveFailed": "Could not finish the activity and save the report",
    "saveAndFinish": "Save & Finish",
    "noRating": "No Rating",
    "summaryLabel": "Report Summary",
    "summaryPlaceholder": "Write what happened and the outcome of the contact..."
  },
  "nextActionFields": {
    "dateLabel": "Next Action Date"
  },
  "nextActions": {
    "none": "No Action",
    "call_again": "Follow-up Call",
    "schedule_meeting": "Follow-up Meeting",
    "create_task": "Create Task",
    "send_proposal": "Send Proposal",
    "send_email": "Send Email"
  },
  "outcomes": {
    "call": {
      "connected": "Connected",
      "no_answer": "No Answer",
      "interested": "Interested",
      "not_interested": "Not Interested",
      "wrong_number": "Wrong Number"
    },
    "meeting": {
      "completed": "Meeting Completed",
      "proposal_requested": "Quote Requested",
      "deal_possible": "Sale Opportunity",
      "postponed": "Postponed",
      "no_show": "No Show"
    }
  },
  "form": {
    "typeLabel": "Activity Type",
    "titleLabel": "Title",
    "titlePlaceholder": "Activity title",
    "startLabel": "Activity Start",
    "endLabel": "Activity End",
    "descriptionLabel": "Description",
    "descriptionPlaceholder": "Write any notes or the activity's goal...",
    "relatedTypeLabel": "Link Type",
    "relatedIdLabel": "Customer / Lead ID",
    "relatedIdPlaceholder": "e.g. 53",
    "assignedUserLabel": "Assigned User",
    "assignedUserPlaceholder": "User ID",
    "teamPlaceholder": "Team ID",
    "phoneLabel": "Phone Number",
    "phonePlaceholder": "Customer number or contact number",
    "meetingLocationLabel": "Meeting Location",
    "reminderBeforeLabel": "Reminder Before",
    "reminderUnitLabel": "Reminder Unit",
    "allStatuses": "All Statuses",
    "allPriorities": "All Priorities",
    "userLabel": "User"
  },
  "lifecycleActions": {
    "view": "View",
    "followUp": "Follow up"
  },
  "drawer": {
    "detailsTitle": "Activity Details",
    "tabs": {
      "overview": "Overview",
      "preparation": "Preparation",
      "files": "Files",
      "history": "History"
    },
    "durationLabel": "Duration",
    "endLabel": "End",
    "meetingOrCallModeLabel": "Meeting / Call Method",
    "customerBeforeContactTitle": "Customer Data Before Contact",
    "preparationNotesTitle": "Preparation Notes",
    "preparationHint": "This data is gathered from the activity's relation to the Lead/Customer. This tab can later be expanded to show the last task, last proposal, and last conversation once available from the API.",
    "noFilesAttached": "No attached files.",
    "noDetailedHistory": "No detailed history available from the API for this activity.",
    "eventFallback": "Event",
    "noNotesYet": "No notes on this activity.",
    "noParticipantsRegistered": "No registered participants.",
    "invitedStatus": "Invited"
  },
  "participantStatus": {
    "accepted": "Accepted",
    "declined": "Declined",
    "attended": "Attended"
  },
  "reportFields": {
    "callDurationLabel": "Call Duration (minutes)",
    "callDurationPlaceholder": "e.g. 15",
    "attendeesCountLabel": "Number of Attendees",
    "attendeesCountPlaceholder": "e.g. 3"
  },
  "validation": {
    "titleRequired": "Title is required",
    "taskableIdRequired": "Customer or Lead number is required",
    "startAtRequired": "Start time is required",
    "meetingLinkRequired": "Meeting link is required for an online meeting",
    "locationRequired": "Meeting location is required for an in-person meeting",
    "endAfterStart": "End must be after start",
    "outcomeRequired": "Outcome is required",
    "summaryRequired": "Report summary is required",
    "nextActionRequired": "Choose the next action",
    "nextActionAtRequired": "Next action time is required"
  },
  "filters": {
    "searchPlaceholder": "Search by title, customer, company...",
    "clear": "Clear",
    "fromDate": "From Date",
    "toDate": "To Date"
  },
  "calendar": {
    "noActivities": "No activities in the calendar.",
    "noDate": "No date"
  },
  "emptyState": {
    "defaultTitle": "No activities",
    "defaultDescription": "Create your first call or meeting to start following up with customers.",
    "createActivity": "Create Activity",
    "clearFilters": "Clear Filters"
  },
  "header": {
    "description": "Manage all calls and meetings for all leads in one place.",
    "newActivity": "New Activity"
  },
  "formDialog": {
    "updatedToast": "Activity updated.",
    "createdToast": "Activity created.",
    "saveFailed": "Could not save the activity",
    "newActivityTitle": "Create New Activity",
    "description": "A call or meeting linked to a customer or Lead in the Leads Center.",
    "saveActivity": "Save Activity"
  },
  "typeMeta": {
    "all": "All",
    "callPlural": "Calls",
    "meetingPlural": "Meetings",
    "allShort": "All",
    "callShort": "Call",
    "meetingShort": "Meeting"
  },
  "derivedStates": {
    "today": "Today",
    "upcoming": "Upcoming",
    "overdue": "Overdue"
  },
  "untitledCall": "Untitled call",
  "untitledMeeting": "Untitled meeting",
  "viewModeTabs": {
    "table": "Table",
    "calendar": "Calendar"
  }
}
