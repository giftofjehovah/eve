'use strict'
const token = '228349129:AAHgIK5kHaNBuzPoZpeNevb6FAVDOY7JMMI'
const bot = require('telegram-node-bot')(token)

bot.router
  .when(['/start'], 'StartController')
  .when(['/ping'], 'PingController')
  .when(['age'], 'AgeController')
  .when(['/date', '/date :date', '/location', '/location :location'], 'EventController')
  .when(['/status'], 'StatusController')
  .when(['/change'], 'ChangeController')
  .otherwise('OtherwiseController')

bot.controller('PingController', ($) => {
  bot.for('/ping', () => {
    $.sendMessage('this is chicken friendly: ')
    $.sendMessage('Chat ID: ' + $.chatId)
    $.sendMessage('User ID: ' + $.user.id)
    console.log($)
  })
})

bot.controller('StartController', ($) => {
  var form = {
    date: {
      q: 'What date is the event? (dd/mm)',
      error: 'sorry, wrong input',
      validator: (input, callback) => {
        if (input['text']) {
          callback(true)
          return
        }
        callback(false)
      }
    },
    time: {
      q: 'What time is the event? (hh:mm)',
      error: 'sorry, wrong input',
      validator: (input, callback) => {
        if (input['text']) {
          callback(true)
          return
        }
        callback(false)
      }
    },
    location: {
      q: 'Where is the event located?',
      error: 'sorry, wrong input',
      validator: (input, callback) => {
        if (input['text']) {
          callback(true)
          return
        }
        callback(false)
      }
    }
  }
  $.runForm(form, (result) => {
    console.log(result)
    $.sendMessage(`You have an event on ${result.date} at ${result.time} at  ${result.location}`)
  })
})

bot.controller('EventController', ($) => {
  bot.for('/date', () => {
    $.sendMessage('Date: ' + '15/5')
  })
  bot.for('/date :date', () => {
    $.sendMessage('Date: ' + $.query.date)
  })
  bot.for('/time', () => {
    $.sendMessage('Time: ' + '15:15')
  })
  bot.for('/time :time', () => {
    $.sendMessage('Time: ' + $.query.time)
  })
  bot.for('/where', () => {
    $.sendMessage('Location: ' + 'The Hub')
    $.sendLocation(1.290270, 103.851959)
  })
  bot.for('/location', () => {
    $.sendMessage('Where is the event located?')
    $.waitForRequest(($) => {
      const location = $.message.text
      $.sendMessage(`Location set to ${location}`)
    })
  })
})

bot.controller('StatusController', ($) => {
  bot.for('/status', ($) => {
    const location = 'Jurong'
    const datetime = '12/5 12:00'
    const participants = ['ZJ', 'CX', 'Jon', 'Stef', 'JR']
    $.sendMessage(`Location: ${location}
Date/Time: ${datetime}
Participants: ${participants}`)
  })
})

bot.controller('ChangeController', ($) => {
  bot.for('/change', ($) => {
    $.runMenu({
      message: 'What would you like to change?',
      layout: 3,
      'Date': () => {
        $.sendMessage('You selected Option A!')
      },
      'Time': () => {
        $.sendMessage('You selected Option B!')
      },
      'Location': () => {
        $.routeTo('/location')
      },
      options: {
        parse_mode: 'Markdown'
      },
      'Exit': {
        message: 'Do you realy want to exit?',
        resize_keyboard: true,
        'Yes': () => {
        },
        'No': () => {
        }
      },
      'anyMatch': () => {
      }
    })
  })
})

bot.controller('OtherwiseController', ($) => {
})
