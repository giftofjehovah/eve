var Event = require('../models/event')


function getEvent(req, res) {
  var id = req.params.id;
  Event.find({chatId: id}, function(error, event) {
    if(error) res.json({message: 'Could not find product b/c:' + error});
    res.render('events/detail', {event: event});
  });

}
