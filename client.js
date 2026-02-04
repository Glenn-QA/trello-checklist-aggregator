// Trello Checklist Aggregator Power-Up Client

const ICON_URL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDc5YmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI5IDExIDEyIDE0IDIyIDQiPjwvcG9seWxpbmU+PHBhdGggZD0iTTIxIDEydjdhMiAyIDAgMCAxLTIgMkg1YTIgMiAwIDAgMS0yLTJWNWEyIDIgMCAwIDEgMi0yaDExIj48L3BhdGg+PC9zdmc+';

TrelloPowerUp.initialize({
  'board-buttons': function(t, options) {
    return [{
      icon: {
        dark: ICON_URL,
        light: ICON_URL
      },
      text: 'Checklist Stats',
      callback: function(t) {
        return t.modal({
          title: 'Board Checklist Statistics',
          url: './stats.html',
          height: 600
        });
      }
    }];
  },

  'show-settings': function(t, options) {
    return t.popup({
      title: 'Checklist Aggregator Settings',
      items: [
        {
          text: 'View Statistics',
          callback: function(t) {
            return t.modal({
              title: 'Board Checklist Statistics',
              url: './stats.html',
              height: 600
            });
          }
        },
        {
          text: 'About',
          callback: function(t) {
            return t.alert({
              message: 'Checklist Aggregator v1.0\n\nShows checklist completion badges on cards and aggregates board-wide statistics.',
              duration: 5
            });
          }
        }
      ]
    });
  },

  'card-badges': async function(t, options) {
    try {
      const card = await t.card('id', 'name', 'checklists');
      console.log('Badge rendering for card:', card.name);
      
      if (!card.checklists || card.checklists.length === 0) {
        console.log('  No checklists found');
        await t.set('card', 'shared', 'checklistStats', null);
        return [];
      }

      console.log('  Found', card.checklists.length, 'checklists');

      let totalItems = 0;
      let completedItems = 0;

      // Count checklist items
      card.checklists.forEach((checklist, idx) => {
        console.log('    Checklist', idx, ':', checklist.name, 'checkItems:', checklist.checkItems);
        if (checklist.checkItems && checklist.checkItems.length > 0) {
          checklist.checkItems.forEach(item => {
            totalItems++;
            if (item.state === 'complete') {
              completedItems++;
            }
          });
        } else {
          console.log('    NO checkItems or empty array!');
        }
      });

      console.log('  Total items found:', totalItems);

      if (totalItems === 0) {
        console.log('  No items, not storing');
        await t.set('card', 'shared', 'checklistStats', null);
        return [];
      }

      const percentage = Math.round((completedItems / totalItems) * 100);

      // Store stats for board aggregation
      console.log('Storing stats for:', card.name, `${completedItems}/${totalItems}`);
      await t.set('card', 'shared', 'checklistStats', {
        cardName: card.name,
        total: totalItems,
        completed: completedItems,
        percentage: percentage
      });
      console.log('Stats stored successfully');

      // Display badge
      return [{
        icon: ICON_URL,
        text: `${completedItems}/${totalItems}`,
        color: percentage === 100 ? 'green' : percentage >= 50 ? 'blue' : 'orange'
      }];
    } catch (error) {
      console.log('Card badge error:', error);
      return [];
    }
  }
});

console.log('Checklist Aggregator Power-Up loaded');
