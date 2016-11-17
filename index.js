'use strict'
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eve'
const mongoose = require('mongoose')
const Event = require('./models/event')
const CronJob = require('cron').CronJob
const moment = require('moment')
const geocoder = require('geocoder')

mongoose.connect(mongoUri)
console.log(mongoose.connection.host)
console.log(mongoose.connection.port)
app.listen(port, function () {
  console.log('server listening on port ' + port)
})

new CronJob('* * * * *', function () {
  var now = moment()
  var hourLater = moment() + 60 * 60 * 1000

  Event.find({datetime: {$gt: now, $lt: hourLater}, reminded: false}).exec(callback)

  function callback (err, events) {
    if (err) throw err
    if (events.length > 0) {
      events.forEach(function (event) {
        event.reminded = true
        event.save()
        bot.sendMessage(event.chatId, `You have an upcoming event within the next hour.\n ${event.date} at ${event.time} at  ${event.location}`)
        bot.sendLocation(event.chatId, event.latitude, event.longtitude)
      })
    }
  }
}, null, true, 'Asia/Singapore')

const token = '232947211:AAFLJuWF0_e_a_SxljxLdcD06nZ0aCML6M8'
const bot = require('./telegram')(token)
// const bot = require('telegram-node-bot')(token)

bot.router
  .when(['/start', '/help'], 'StartController')
  .when(['/create'], 'CreateController')
  .when(['/cancel'], 'CancelController')
  .when(['/in', '/out'], 'RSVPController')
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
  bot.for('/start', () => {
    $.sendMessage(`
Hi, I'm BetterStef
/create - create a new event
/status - check an existing event
/in - you're attending
/out - you're not attending
      `)
  })
})

bot.controller('CreateController', ($) => {
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
          const event = new Event()
          const date = moment(result.date, 'DD-MM').format('Do MMM YYYY')
          const time = moment(result.time, 'HH:mm').format('HH:mm')
          const datetime = moment(result.date + ' ' + result.time, 'DD-MM HH:mm')
          console.log(date, time, datetime)
          event.create($.chatId, result.location, date, time, datetime, function (err, info) {
            if (err) throw err
            $.sendMessage(`
You have an event on ${info.date} at ${info.time} at  ${info.location}
/in to indicate you're going
/out to indicate you're not
/status to check the event status
              `)
          })
        })
      } else {
        $.sendMessage('You already have an event currently')
      }
    })
  })
})

bot.controller('CancelController', ($) => {
  Event.findOne({chatId: $.chatId}, (err, event) => {
    if (err) throw err
    if (event) {
      // delete event
      $.runMenu({
        message: 'Are you sure you want to delete the event?',
        layout: 2,
        'Yes': () => {
          event.remove()
          $.sendMessage('Event has been deleted.')
        },
        'No': () => {
          $.sendMessage('Event was not deleted.')
        }
      })
    } else {
      $.sendMessage('There is no event scheduled. /create to get started.')
    }
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
          geocoder.geocode(event.location, (err, data) => {
            if (err) throw err
            if (data) {
              event.latitude = data.results[0].geometry.location.lat
              event.longtitude = data.results[0].geometry.location.lng
            }
            event.save(function (err, event) {
              if (err) throw err
              $.sendMessage(`Location set to ${location}`)
            })
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
        if (event.participants.length > 0) msg += `Participants: ${event.participants.join(', ')}`
        $.sendMessage(msg)
        if (event.latitude && event.longtitude) {
          $.sendLocation(event.latitude, event.longtitude)
        }
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
      } else {
        $.sendMessage('No events scheduled. /create to create an event.')
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
      } else {
        $.sendMessage('No events scheduled. /create to create an event.')
      }
    })
  })
})

bot.controller('ChangeController', ($) => {
  bot.for('/change', ($) => {
    Event.findOne({chatId: $.chatId}, (err, event) => {
      if (err) throw err
      if (event) {
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
      } else {
        $.sendMessage('No events scheduled. /create to create an event.')
      }
    })
  })
})

bot.controller('OtherwiseController', ($) => {
  // $.sendMessage($.message.text)
})
