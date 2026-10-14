// Product / service details: completeness, quick-view drawer, guided completion (added 2026-10-15).
export default {
  checks: {
    name: 'Name',
    price: 'Price',
    itemType: 'Item type',
    category: 'Category',
    description: 'Description',
    image: 'Image',
  },
  columns: { completeness: 'Completeness' },
  completeness: {
    label: 'Data completeness',
    title: 'Data {{done}} of {{total}} complete',
    missing: 'Missing: {{items}}',
    complete: 'All the main data is filled in.',
    action: 'Complete the data',
  },
  drawer: {
    description: 'Quick view of every field. Open the page for the full details and larger image.',
    openPage: 'Open full page',
    noUnits: 'Only the base unit.',
  },
  page: { backTo: 'Back to {{list}}' },
  complete: {
    title: 'Complete "{{name}}"',
    description: 'Only what is missing, one step at a time. Skip anything you want to fill later; nothing is saved until the last step.',
    stepsLabel: 'Completion steps',
    backToItem: 'Back to the item',
    later: 'Later',
    save: 'Save the data',
    saved: 'Data saved',
    after: 'Completeness goes from {{before}}% to {{after}}%.',
    leftEmpty: 'Left for later',
    itemTypeNote: 'Choosing a type adds its capability fields in the next step. Its default units and attached items apply to new items only; add them from the item page tabs.',
    steps: {
      name: {
        title: 'Name',
        description: 'The item has no name yet.',
        guide: { title: 'Name it', text: 'Use the name your team and customers know it by.', points: { a: 'Short and clear, e.g. "Split AC 1.5 HP".' } },
      },
      price: {
        title: 'Price',
        description: 'Set the price of one base unit.',
        guide: { title: 'Its price', text: 'The price of one piece, hour or visit. Bigger units have their own prices in the Units tab.', points: { a: '0 is allowed for free items.' } },
      },
      itemType: {
        title: 'Item type',
        description: 'A type decides the item\'s capabilities and pieces.',
        guide: {
          title: 'Why a type?',
          text: 'The type tells the system what this item needs: serials, expiry, warranty, booking… and makes the next items of the same kind quick to add.',
          points: { a: 'Pick the closest type, or create one quickly.', b: 'The type card shows what it brings.' },
        },
      },
      capabilities: {
        title: 'Type details',
        description: 'The capability fields of the chosen type, for this item.',
        guide: { title: 'Defaults or your values', text: 'Leave a field empty to use the type default, or write the value for this item.', points: { a: 'e.g. 36 months of warranty instead of the type\'s 24.' } },
      },
      category: {
        title: 'Category',
        description: 'Where the item is listed.',
        guide: { title: 'Find its place', text: 'Choose the category; its parents and their details show below so you pick the right branch.', points: { a: 'Missing one? Add a quick category.' } },
      },
      description: {
        title: 'Description',
        description: 'A few lines customers and the team read.',
        guide: { title: 'Describe it', text: 'What it is, the main specs and what is included. It shows on the item page and in proposals.', points: { a: 'Two or three lines are enough.' } },
      },
      image: {
        title: 'Image',
        description: 'A picture makes the item easy to recognize.',
        guide: { title: 'Add a picture', text: 'A clear photo on a plain background works best.', points: { a: 'JPG or PNG.' } },
      },
      review: {
        title: 'Review and save',
        description: 'Check what will be saved.',
        guide: { title: 'Almost done', text: 'Check each item and save once. Items you skipped stay missing and can be completed later.', points: { a: 'Use "Edit" to go back to an item.' } },
      },
    },
  },
}
