export default {
  appearance: {
    nav: {
      title: 'Appearance',
    },
    page: {
      title: 'Appearance',
      description:
        'Customize the two brand colors used across the app. Changes preview instantly; use Save to keep them after a reload.',
    },
    fields: {
      primary: {
        label: 'Brand primary',
        hint: 'Used for the sidebar, header and primary buttons.',
        hexAriaLabel: 'Brand primary hex value',
        pickerAriaLabel: 'Pick brand primary color',
      },
      accent: {
        label: 'Brand accent',
        hint: 'Used for links, focus rings, calls to action and AI surfaces.',
        hexAriaLabel: 'Brand accent hex value',
        pickerAriaLabel: 'Pick brand accent color',
      },
    },
    actions: {
      save: 'Save',
      reset: 'Reset to default',
    },
    persistenceNote:
      'Saved colors are stored on this browser only — they do not yet sync to other devices or other users at your tenant.',
    toast: {
      saved: 'Brand colors saved',
      reset: 'Brand colors reset to default',
    },
    preview: {
      title: 'Live preview',
      buttonPrimary: 'Primary action',
      buttonAccent: 'Accent action',
      statusNote: 'Status colors are consistent across the app and are not affected by your brand colors.',
      ai: {
        title: 'AI suggestion',
        body: 'This is a preview of how AI surfaces look with your accent color.',
      },
    },
  },
}
