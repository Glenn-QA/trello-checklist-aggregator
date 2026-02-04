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
              message: 'Checklist Aggregator v1.0\n\nShows checklist completion on cards and aggregates board-wide statistics.',
              duration: 5
            });
          }
        }
      ]
    });
  },

  'card-badges': async function(t, options) {
    try {
      const card = await t.card('id', 'name', 'checklists', 'members');
      
      if (!card.checklists || card.checklists.length === 0) {
        // No checklists - remove stored stats
        await t.set('card', 'shared', 'checklistStats', null);
        return [];
      }

      let totalItems = 0;
      let completedItems = 0;
      const memberStats = {}; // Track by member

      card.checklists.forEach(checklist => {
        if (checklist.checkItems && checklist.checkItems.length > 0) {
          checklist.checkItems.forEach(item => {
            totalItems++;
            if (item.state === 'complete') {
              completedItems++;
            }
            
            // Track member assignments
            if (item.idMember) {
              if (!memberStats[item.idMember]) {
                memberStats[item.idMember] = {
                  total: 0,
                  completed: 0
                };
              }
              memberStats[item.idMember].total++;
              if (item.state === 'complete') {
                memberStats[item.idMember].completed++;
              }
            }
          });
        }
      });

      if (totalItems === 0) {
        await t.set('card', 'shared', 'checklistStats', null);
        return [];
      }

      const percentage = Math.round((completedItems / totalItems) * 100);

      // Store this card's stats including member data
      const stats = {
        cardId: card.id,
        cardName: card.name,
        total: totalItems,
        completed: completedItems,
        percentage: percentage,
        memberStats: memberStats,
        timestamp: Date.now()
      };
      
      await t.set('card', 'shared', 'checklistStats', stats);

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
