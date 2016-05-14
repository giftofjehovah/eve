const mongoose = require('mongoose')
const geocoder = require('geocoder')

const eventSchema = mongoose.Schema({
  chatId: String,
  location: String,
  date: Date,
  time: Date,
  participants: [String],
  status: Boolean,
  latitude: String,
  longtitude: String
})

eventSchema.methods.create = (chatId, location, date, time, cb) => {
  this.chatId = chatId
  this.location = location
  this.date = date
  this.time = time

  geocoder.geocode(this.location, (err, data) => {
    if (err) throw err
    this.latitude = data.results[0].geometry.location.lat
    this.longtitude = data.results[0].geometry.location.lng

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

eventSchema.methods.addParticipants = (participants, cb) => {
  participants.forEach((participant) => {
    this.participants.push(participant)
  })

  this.save((err, event) => {
    if (err) cb(err, null)
    var info = {
      participants: event.participants
    }
    cb(null, info)
  })
}

eventSchema.methods.removeParticipants = (participant, cb) => {
  this.participants.forEach((member, i) => {
    if (member === participant) {
      this.participants.splice(i, 1)
      return
    }
  })

  this.save((err, event) => {
    if (err) cb(err, null)
    var info = {
      participants: event.participants
    }
    cb(null, info)
  })
}

module.exports = mongoose.model('Event', eventSchema)
