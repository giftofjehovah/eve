'use strict'

const express     = require('express')
const router      = express.Router()
const bodyParser = require('body-parser') //parses information from POST
const methodOverride = require('method-override') //used to manipulate POST

const eventsController   = require('../controllers/eventsController');


router.route('/events/:id')
    .get(eventsController.getEvent)

module.exports = router
