'use strict'
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/eve'
const mongoose = require('mongoose')
const Event = require('./models/event')

mongoose.connect(mongoUri)
app.listen(port, function () {
  console.log('server listening on port ' + port)
})

const token = '228349129:AAHgIK5kHaNBuzPoZpeNevb6FAVDOY7JMMI'
const bot = require('./telegram')(token)
// const bot = require('telegram-node-bot')(token)

bot.router
  .when(['/create'], 'StartController')
  .when(['/in', '/out', 'in', 'out'], 'RSVPController')
  .when(['/ping'], 'PingController')
  .when(['/date', '/time', '/location'], 'EventController')
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
  const form = {
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

  bot.for('/create', ($) => {
    Event.findOne({chatId: $.chatId}, function (err, event) {
      if (err) throw err
      if (!event) {
        $.runForm(form, (result) => {
          var event = new Event()
          event.create($.chatId, result.location, result.date, result.time, function (err, info) {
            if (err) throw err
            $.sendMessage(`You have an event on ${info.date} at ${info.time} at  ${info.location}`)
          })
        })
      } else {
        $.sendMessage('You already have an event currently')
      }
    })
  })
})

bot.controller('EventController', ($) => {
  bot.for('/date', () => {
    Event.findOne({chatId: $.chatId}, (err, event) => {
      if (err) throw err
      if (event) {
        $.sendMessage(`Current date: ${event.date}. Change? (dd/mm)`)
        $.waitForRequest(($) => {
          const date = $.message.text
          event.date = date
          event.save(function (err, event) {
            if (err) throw err
            $.sendMessage(`Date set to ${event.date}`)
          })
        })
      } else {
        $.sendMessage('You need to /create an event first.')
      }
    })
  })
  bot.for('/time', () => {
    Event.findOne({chatId: $.chatId}, (err, event) => {
      if (err) throw err
      if (event) {
        $.sendMessage('What time is the event? (hh:mm)')
        $.waitForRequest(($) => {
          const time = $.message.text
          event.time = time
          event.save(function (err, event) {
            if (err) throw err
            $.sendMessage(`Time set to ${time}`)
          })
        })
      } else {
        $.sendMessage('You need to /create an event first.')
      }
    })
  })
  bot.for('/location', () => {
    Event.findOne({chatId: $.chatId}, (err, event) => {
      if (err) throw err
      if (event) {
        $.sendMessage('Where is the event located?')
        $.waitForRequest(($) => {
          const location = $.message.text
          event.location = location
          event.save(function (err, event) {
            if (err) throw err
            $.sendMessage(`Location set to ${location}`)
          })
        })
      } else {
        $.sendMessage('You need to /create an event first.')
      }
    })
  })
})

bot.controller('StatusController', ($) => {
  bot.for('/status', ($) => {
    Event.findOne({chatId: $.chatId}, function (err, event) {
      if (err) throw err
      if (!event) {
        $.sendMessage('There is no event yet\n/create event')
      } else {
        var msg = ''
        if (event.location) msg += `Location: ${event.location}\n`
        if (event.time) msg += `Time: ${event.time}\n`
        if (event.date) msg += `Date: ${event.date}\n`
        if (event.participants.length > 0) msg += `Participants: ${event.participants}`
        $.sendMessage(msg)
      }
    })
  })
})

bot.controller('RSVPController', ($) => {
  bot.for('/in', () => {
    Event.findOne({chatId: $.chatId}, (err, event) => {
      if (err) throw err
      if (event) {
        const name = `${$.message.from.first_name} ${$.message.from.last_name}`
        event.addParticipants(name, (err, info) => {
          if (err) throw err
          if (info.status) {
            const people = info.participants.join(', ')
            $.sendMessage(`participants for the event are:\n ${people}`)
          } else {
            $.sendMessage('already in la dey')
          }
        })
      }
    })
  })
  bot.for('/out', () => {
    Event.findOne({chatId: $.chatId}, (err, event) => {
      if (err) throw err
      if (event) {
        const name = `${$.message.from.first_name} ${$.message.from.last_name}`
        event.removeParticipant(name, (err, info) => {
          if (err) throw err
          if (info.status) {
            const people = info.participants.join(', ')
            $.sendMessage(`participants for the event are:\n ${people}`)
          } else {
            $.sendMessage('already out la dey')
          }
        })
      }
    })
  })
})

bot.controller('ChangeController', ($) => {
  bot.for('/change', ($) => {
    $.runMenu({
      message: 'What would you like to change?',
      layout: 3,
      'Date': () => {
        $.routeTo('/date')
      },
      'Time': () => {
        $.routeTo('/time')
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
  // $.sendMessage($.message.text)
})
