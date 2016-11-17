const mongoose = require('mongoose')
const MapboxClient = require('mapbox')
const client = new MapboxClient('pk.eyJ1IjoiZ2lmdG9mamVob3ZhaCIsImEiOiJjaXB4Zmk3NnIwdzduZnZtMjg5OXRxZHlqIn0.Rm78HdPFp83YJhzwhP40Uw')

const eventSchema = mongoose.Schema({
  chatId: String,
  location: String,
  date: String,
  time: String,
  datetime: Date,
  participants: [String],
  status: Boolean,
  latitude: Number,
  longtitude: Number,
  reminded: Boolean
})

eventSchema.methods.create = function (chatId, location, date, time, datetime, cb) {
  this.chatId = chatId
  this.location = location
  this.date = date
  this.time = time
  this.datetime = datetime
  this.reminded = false

  client.geocodeForward(this.location, (err, data) => {
    if (err) throw err
    if (data) {
      console.log('location', data.features[0].geometry.coordinates)
      this.latitude = data.features[0].geometry.coordinates[0]
      this.longtitude = data.features[0].geometry.coordinates[1]
    }
    // console.log('this is', this)
    this.save(function (err, event) {
      console.log('saving?')
      if (err) cb(err, null)
      var info = {
        location: event.location,
        date: event.date,
        time: event.time,
        datetime: event.datetime
      }
      cb(null, info)
    })
    // this.save().then(function (event) {
    //   var info = {
    //     location: event.location,
    //     date: event.date,
    //     time: event.time,
    //     datetime: event.datetime
    //   }
    //   cb(null, info)
    // }).catch(function (err) {
    //   cb(err, null)
    // })
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
