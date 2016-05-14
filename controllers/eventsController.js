var Event = require('../models/event')

function getIndex (req, res) {
  res.send('Hey there!')
}

function getEvent(req, res) {
  var id = req.params.id;
  console.log(id)
  Event.findOne({chatId: '12353'}, function(error, event) {
    if(error) throw error
    console.log(event)
    res.render('layout', {event: event});
  });

}

module.exports = {
    getEvent: getEvent,
    getIndex: getIndex
}
