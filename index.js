'use strict'
const token = '228349129:AAHgIK5kHaNBuzPoZpeNevb6FAVDOY7JMMI'
const bot = require('telegram-node-bot')(token)
const sentiment = require('sentiment')

bot.router
  .when(['/start'], 'StartController')
  // .when(['/stop'], 'StopController')
  // .when(['/restart'], 'RestartController')
  .when(['/remove :userid'], 'RemoveController')
  .when(['/ping'], 'PingController')
  .otherwise('OtherwiseController')

bot.controller('RemoveController', ($) => {
  bot.for('/remove :userid', () => {
    $.sendMessage('this is chicken friendly')
  })
})

bot.controller('PingController', ($) => {
  bot.for('/ping', () => {
    $.sendMessage('this is chicken friendly' + $.chatId)
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
