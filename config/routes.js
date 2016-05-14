'use strict'

const express     = require('express')
const router      = express.Router()
const eventsController   = require('../controllers/eventsController');

router.route('/').get(eventsController.getIndex)

router.route('/events/:id').get(eventsController.getEvent)

module.exports = router
