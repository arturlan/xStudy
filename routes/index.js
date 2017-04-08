var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');

var request = require('request');
var $ = require("jquery");        
var knex = require('../db/knex');

//API url
var url = 'https://api.stackexchange.com/2.2/';
var searchUrlAppend = 'search?order=desc&sort=votes&site=stackoverflow&intitle=';

var questionAnswerUrlAppend = '?site=stackoverflow&filter=withbody';

router.get('/', function(req, res, next) {
    res.render('index')
});

router.post('/', function(req, res, next) {
    var query = req.body.query;

    var searchUrl = url + searchUrlAppend + encodeURIComponent(query.trim());
    console.log('This is my url: ' + searchUrl);
    request(searchUrl, function(error, response, body) {
        if (!error && response.statusCode == 200) {
        }
    })
    console.log(req);

    res.redirect('/');
});


module.exports = router;
