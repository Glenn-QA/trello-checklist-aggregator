// Trello Checklist Aggregator Power-Up
// This Power-Up aggregates all checklist items across all cards on a board

const ICON_URL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDc5YmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI5IDExIDEyIDE0IDIyIDQiPjwvcG9seWxpbmU+PHBhdGggZD0iTTIxIDEydjdhMiAyIDAgMCAxLTIgMkg1YTIgMiAwIDAgMS0yLTJWNWEyIDIgMCAwIDEgMi0yaDExIj48L3BhdGg+PC9zdmc+';

async function calculateBoardStats(t) {
  try {
    const cards = await t.cards('all');
    
    let totalItems = 0;
    let completedItems = 0;
    let cardsWithChecklists = 0;

    for (const card of cards) {
      if (card.checklists && card.checklists.length > 0) {
        cardsWithChecklists++;
        
        card.checklists.forEach(checklist => {
          checklist.checkItems.forEach(item => {
            totalItems++;
            if (item.state === 'complete') {
              completedItems++;
            }
          });
        });
      }
    }

    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    const remaining = totalItems - completedItems;

    return {
      totalItems,
      completedItems,
      remaining,
      percentage,
      cardsWithChecklists
    };
  } catch (error) {
    console.error('Error calculating stats:', error);
    return null;
  }
}

window.TrelloPowerUp.initialize({
  // Add board button to open the statistics modal
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
          url: 'https://glenn-qa.github.io/trello-checklist-aggregator/index.html',
          height: 600
        });
      }
    }];
  },

  // Show badge on board button with completion percentage
  'show-settings': function(t, options) {
    return t.popup({
      title: 'Checklist Aggregator Settings',
      items: [
        {
          text: 'View Statistics',
          callback: function(t) {
            return t.modal({
              title: 'Board Checklist Statistics',
              url: 'https://glenn-qa.github.io/trello-checklist-aggregator/index.html',
              height: 600
            });
          }
        },
        {
          text: 'About',
          callback: function(t) {
            return t.alert({
              message: 'Checklist Aggregator v1.0\n\nAggregates all checklist items across your board and shows completion statistics.',
              duration: 5
            });
          }
        }
      ]
    });
  },

  // Add header badge showing overall completion
  'board-badges': async function(t, options) {
    const stats = await calculateBoardStats(t);
    
    if (!stats || stats.totalItems === 0) {
      return [];
    }

    return [{
      icon: ICON_URL,
      text: `${stats.percentage}%`,
      color: stats.percentage === 100 ? 'green' : stats.percentage >= 50 ? 'blue' : 'orange',
      callback: function(t) {
        return t.modal({
          title: 'Board Checklist Statistics',
          url: 'https://glenn-qa.github.io/trello-checklist-aggregator/index.html',
          height: 600
        });
      }
    }];
  },

  // Add capability to show quick stats in card badges
  'card-badges': async function(t, options) {
    const card = await t.card('checklists');
    
    if (!card.checklists || card.checklists.length === 0) {
      return [];
    }

    let totalItems = 0;
    let completedItems = 0;

    card.checklists.forEach(checklist => {
      checklist.checkItems.forEach(item => {
        totalItems++;
        if (item.state === 'complete') {
          completedItems++;
        }
      });
    });

    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return [{
      icon: ICON_URL,
      text: `${completedItems}/${totalItems}`,
      color: percentage === 100 ? 'green' : percentage >= 50 ? 'blue' : 'orange'
    }];
  }
});

console.log('Trello Checklist Aggregator Power-Up loaded successfully');
