// Realistic API payloads covering the fallback branches of the legacy
// normalizers in utils/{whatsapp,messenger,gmail}Conversations.js.
// Media URLs are absolute so results do not depend on the tenant/env.

export const whatsappFixtures = {
  conversationInfo: {
    id: 41,
    phone_number_id: 'PN1',
    contact: { id: 7, name: 'Mona Ali', phone: '+201001234567', external_id: '201001234567' },
  },
  conversations: {
    full: {
      id: 41,
      contact: {
        id: 7,
        name: 'Mona Ali',
        phone: '+201001234567',
        external_id: '201001234567',
        profile_picture: 'https://cdn.example.com/mona.jpg',
      },
      customer: { id: 12, name: 'Mona Ali', phone: '+201001234567', email: 'mona@example.com' },
      lead: { id: 99, name: 'Mona Lead' },
      phone_number_id: 'PN1',
      unread_count: '3',
      status: 'OPEN',
      assigned_user: { id: 5, name: 'Sara' },
      last_message_at: '2026-09-20T10:00:00Z',
      updated_at: '2026-09-19T10:00:00Z',
      last_message: {
        id: 900,
        message_id: 'wamid.900',
        body: 'Hello, is the offer still valid?',
        direction: 'inbound',
        sent_at: '2026-09-20T10:00:00Z',
      },
    },
    firstLastName: {
      conversation_id: 42,
      contact: { first_name: 'Omar', last_name: 'Hassan' },
      unread_count: 0,
      status: 'closed',
      customer_id: 30,
      last_message: { type: 'image' },
    },
    phoneOnly: { id: 43, phone: '+201112223334', updated_at: '2026-09-18T08:00:00Z' },
    empty: {},
  },
  messages: {
    outgoingByFromId: {
      id: 1,
      message_id: 'wamid.1',
      from_id: 'PN1',
      body: 'Hi Mona, yes it is.',
      sent_at: '2026-09-20T09:00:00Z',
      status: 'read',
    },
    incomingWithMedia: {
      id: 2,
      whatsapp_message_id: 'wamid.2',
      direction: 'inbound',
      text: { body: 'Here is the photo' },
      created_at: '2026-09-20T08:00:00Z',
      attachments: [{ type: 'image', url: 'https://cdn.example.com/a.jpg', name: 'a.jpg', size: 2048 }],
      reactions: [{ emoji: '👍', reactor_id: 'PN1' }],
      reply_to: { id: 1 },
    },
    fileWithoutId: {
      body: 'Contract attached',
      sent_at: '2026-09-20T07:00:00Z',
      files: [{ mime_type: 'application/pdf', url: 'https://cdn.example.com/contract.pdf' }],
    },
  },
}

export const messengerFixtures = {
  conversationInfo: {
    id: 51,
    page_id: 'PAGE1',
    contact: { id: 8, external_id: 'PSID1', name: 'Youssef' },
  },
  conversations: {
    full: {
      id: 51,
      page_id: 'PAGE1',
      contact: {
        id: 8,
        external_id: 'PSID1',
        name: 'Youssef',
        email: 'youssef@example.com',
        profile_picture: 'https://cdn.example.com/y.jpg',
      },
      customer: { id: 14, name: 'Youssef Co', email: 'sales@youssef.co' },
      lead_id: 70,
      unread_count: 2,
      status: 'open',
      assignedUser: { id: 6, name: 'Karim' },
      last_message_at: '2026-09-21T12:00:00Z',
      last_message: { id: 'm_5', body: 'Price please', direction: 'inbound', sent_at: '2026-09-21T12:00:00Z' },
    },
    usernameOnly: {
      conversation_id: 52,
      contact: { username: 'yara.shop' },
      message: { text: 'Direct text' },
      assigned_user_id: 9,
      assigned_user_name: 'Nour',
    },
    audioLastMessage: { id: 53, name: 'Ahmed', last_message: { type: 'audio' }, status: 'closed' },
    empty: {},
  },
  messages: {
    outgoingByPageId: {
      id: 'm_1',
      from_id: 'PAGE1',
      body: 'Welcome!',
      sent_at: '2026-09-21T11:00:00Z',
    },
    incomingByDirection: {
      message_id: 'm_2',
      direction: 'inbound',
      text: 'I need help',
      created_at: '2026-09-21T10:00:00Z',
      status: 'read',
      attachments: [{ type: 'video', url: 'https://cdn.example.com/v.mp4', mime_type: 'video/mp4', size: 99 }],
      reactions: [{ emoji: '❤️' }],
      reply_to_message_id: 'm_1',
    },
    passThroughDirection: {
      id: 'm_3',
      direction: 'sent',
      message: { title: 'Card title' },
      sent_at: '2026-09-21T09:00:00Z',
    },
  },
}

export const gmailFixtures = {
  conversationInfo: {
    id: 7,
    mailbox_email: 'sales@company.com',
    participant_email: 'client@buyer.com',
    participant_name: 'Client Buyer',
  },
  conversations: {
    full: {
      id: 7,
      subject: 'Quote request',
      mailbox_email: 'sales@company.com',
      participant_email: 'client@buyer.com',
      participant_name: 'Client Buyer',
      customer: { id: 3, name: 'Buyer Co', email: 'client@buyer.com', phone: '+2010000000' },
      unread_count: 1,
      status: 'closed',
      assigned_user_id: 4,
      updated_at: '2026-09-22T09:00:00Z',
      last_message: {
        id: 'g5',
        subject: 'Re: Quote request',
        snippet: 'Thanks, attached.',
        direction: 'received',
        received_at: '2026-09-22T09:00:00Z',
      },
    },
    noParticipant: {
      id: 8,
      mailbox_email: 'sales@company.com',
      lead: { id: 44, name: 'Lead Buyer' },
      last_message: { from_address: 'buyer@other.com' },
    },
    empty: {},
  },
  messages: {
    sentWithAttachment: {
      id: 'g1',
      direction: 'sent',
      subject: 'Quote',
      body_text: 'Please find the quote attached.',
      received_at: '2026-09-22T08:00:00Z',
      from_address: 'sales@company.com',
      sent_by: { id: 4, name: 'Agent' },
      attachments: [{ mime_type: 'application/pdf', filename: 'quote.pdf', url: 'https://cdn.example.com/quote.pdf', size: 5000 }],
    },
    receivedRead: {
      gmail_message_id: 'gm2',
      direction: 'received',
      snippet: 'Looks good',
      created_at: '2026-09-22T07:00:00Z',
      is_read: true,
      from_name: 'Client Buyer',
      from_address: 'client@buyer.com',
    },
    withoutIds: { snippet: 'No ids here', created_at: '2026-09-22T06:00:00Z' },
  },
}
