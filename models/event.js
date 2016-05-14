const mongoose = require('mongoose')
const geocoder = require('geocoder')

const eventSchema = mongoose.Schema({
  chatId: String,
  location: String,
  date: String,
  time: String,
  participants: [String],
  status: Boolean,
  latitude: String,
  longtitude: String
})

eventSchema.methods.create = function (chatId, location, date, time, cb) {
  this.chatId = chatId
  this.location = location
  this.date = date
  this.time = time

  geocoder.geocode(this.location, (err, data) => {
    if (err) throw err
    // this.latitude = data.results[0].geometry.location.lat
    // this.longtitude = data.results[0].geometry.location.lng
    this.save((err, event) => {
      if (err) cb(err, null)
      var info = {
        location: event.location,
        date: event.date,
        time: event.time
      }
      cb(null, info)
    })
  })
}

eventSchema.methods.addParticipants = function (participant, cb) {
  var findPerson = this.participants.find(function (person) {
    return person === participant
  })

  if (!findPerson) {
    this.participants.push(participant)
    this.save((err, event) => {
      if (err) return cb(err, null)
      var info = {
        status: true,
        participants: event.participants
      }
      return cb(null, info)
    })
  } else {
    cb(null, {status: false})
  }
}

eventSchema.methods.removeParticipant = function (participant, cb) {
  var kick = null
  this.participants.forEach((member, i) => {
    if (member === participant) {
      kick = this.participants.splice(i, 1)
      return
    }
  })

  if (kick) {
    this.save((err, event) => {
      if (err) return cb(err, null)
      var info = {
        status: true,
        participants: event.participants
      }
      return cb(null, info)
    })
  } else {
    cb(null, {status: false})
  }
}

module.exports = mongoose.model('Event', eventSchema)
