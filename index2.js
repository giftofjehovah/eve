'use strict'
require('dotenv').config()
const bot = require('telegram-node-bot')(process.env.BOT_TOKEN)
const sentiment = require('sentiment')

bot.router
  .when(['/start'], 'StartController')
  // .when(['/stop'], 'StopController')
  // .when(['/restart'], 'RestartController')
  // .when(['/remove :userId'], 'RemoveController')
  .when(['/create :query'], 'CreateEventController')
  .when(['/location :query'], 'LocationController')
  .when(['/date :query'], 'DateController')
  .when(['/time :query'], 'TimeController')
  .when(['/status :query'], 'StatusController')
  .when(['/in'], 'ConfirmController')
  .when(['/out'], 'CancelController')
  .when(['/stef :type'], 'DrawController')
  .when(['/sticker'], 'StickerController')
  .otherwise('OtherwiseController')

bot.controller('DrawController', ($) => {
  bot.for('/stef :type', ($) => {
    if ($.query.type === 'smile') {
      $.sendMessage('\ud83d\ude03')
    } else if ($.query.type.toLowerCase() === 'is angry') {
      // $.sendMessage('hehe')
      $.sendMessage('\uD83D\uDE20')
    }
    // console.log($)
    // $.sendMessage('asdasdasd')
    // $.sendPhotoFromUrl('http://img.picturequotes.com/2/11/10168/draw-me-like-one-of-your-french-girls-quote-1.jpg')
  })
})

bot.controller('StickerController', ($) => {
  bot.for('/create :query', () => {
    $.sendSticker('test')
  })
})

bot.controller('CreateEventController', ($) => {
  bot.for('/create :query', () => {
    $.sendMessage('removing ' + $.query.userId)
  })
})

bot.controller('LocationController', ($) => {
  bot.for('/location :query', () => {
    $.sendMessage('removing ' + $.query.userId)
  })
})

bot.controller('DateController', ($) => {
  bot.for('/date :query', () => {
    $.sendMessage('removing ' + $.query.userId)
  })
})

bot.controller('TimeController', ($) => {
  bot.for('/time :query', () => {
    $.sendMessage('removing ' + $.query.userId)
  })
})

bot.controller('StatusController', ($) => {
  bot.for('/status :query', () => {
    $.sendMessage('removing ' + $.query.userId)
  })
})

bot.controller('ConfirmController', ($) => {
  bot.for('/in', () => {
    $.sendMessage('removing ' + $.query.userId)
  })
})
bot.controller('CancelController', ($) => {
  bot.for('/out', () => {
    $.sendMessage('removing ' + $.query.userId)
  })
})

bot.controller('StartController', ($) => {
  bot.for('/start', ($) => {
    $.runMenu({
      message: 'Your selection:',
      layout: 2,
      'Option A': () => {
        $.sendMessage('You selected Option A!')
      },
      'Option B': () => {
        $.sendMessage('You selected Option B!')
      },
      'Option C': () => {
        $.sendMessage('You selected Option C!')
      },
      'Option D': () => {
        $.sendMessage('You selected Option D!')
      },
      options: {
        parse_mode: 'Markdown' // in options field you can pass some additional data, like parse_mode
      },
      'Exit': {
        message: 'Do you realy want to exit?',
        resize_keyboard: true,
        'yes': () => {
        },
        'no': () => {
        }
      },
      'anyMatch': () => { // will be executed at any other message

      }
    })
  })
})

bot.controller('OtherwiseController', ($) => {
  bot.for('what :text', ($) => {
    const score = sentiment($.query.text)
    $.sendMessage(score)
  })
})
