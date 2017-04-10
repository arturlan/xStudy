var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
var fetch = require('node-fetch');

var request = require('request');
var $ = require("jquery");
var knex = require('../db/knex');

//API url
var url = 'https://api.stackexchange.com/2.2/';
var searchUrlAppend = 'search?order=desc&sort=votes&site=stackoverflow&key=TvlWJpaYOVpnlNYsIrThqg((&intitle=';

var questionAnswerUrlAppend = '/answers?site=stackoverflow&key=TvlWJpaYOVpnlNYsIrThqg((&filter=withbody';

/*globals*/
var middleVar;

router.get('/', function(req, res, next) {
    res.render('index')
});

router.post('/', function(req, res, next) {
    var query = req.body.query;
    var searchUrl = url + searchUrlAppend + encodeURIComponent(query.trim());
    var index = 0;
    var arrOfAnswers = [];
    // console.log(searchUrl);
    /*This is for JSON parsing titles and ids*/
    var response = request({
        method: 'GET',
        uri: searchUrl,
        gzip: true
    }, function(error, response, body) {
        var arrOfTitles = [];
        var obj = {};
        var firstChar = body.substring(0, 1);
        var firstCharCode = body.charCodeAt(0);
        if (firstCharCode == 65279) {
            console.log('First character "' + firstChar + '" (character code: ' + firstCharCode + ') is invalid so removing it.');
            body = body.substring(1);
        }

        var parsedJson = JSON.parse(body);
        var arr = parsedJson.items;
        arr.forEach(function(item) {
            if (index < 1) {

                arrOfTitles.push(item.title);
                /*This is for getting answers*/
                // gettingAnswers(item.question_id);
                var urlForAnswers = url + 'questions/' + item.question_id + questionAnswerUrlAppend;
                console.log(urlForAnswers);
                fetch(urlForAnswers)
                    .then(function(t) {
                        return t.json();
                    })
                    .then(function(json) {
                        // console.log('this is body'+json.items[0].body);
                        json.items.forEach(function(item) {
                            arrOfAnswers.push(item.body);

                        })
                        update();
                    })
            }
            index++;
        })

        function update() {
            for (var i = 0; i < arrOfTitles.length; i++) {
                obj[arrOfTitles[i]] = arrOfAnswers;
            }
            console.log(Object.values(obj));
            var render = renderingHtml(obj);
            res.send(render);

        }

    })
});


var renderingHtml = function(obj) {
    var arrOfTitles = '<h1>All possible answers:</h1>';
    var css = '#login {text-align: right; } #header {margin-top: 30px;}';
    var jq = '$(document).ready(function() {$("h3").click(function () {var $stext = $(this).next("p").stop(true, true);if ( $stext.is( ":hidden" ) ) {$stext.slideDown(300);} else {$stext.hide();}});});'
    var start = '<!DOCTYPE html><html><head><title>Results</title><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous"><script src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4="crossorigin="anonymous"></script><script>' + jq + '</script></head><style>' + css + '</style><body>';
    var middle = '<div class="row" id="header"><div class="col-xs-6 col-md-6"></div><div class="col-xs-3 col-md-3"></div><div class="col-xs-2 col-md-2" id="login"><a href="/users/login" style="text-decoration:none">Log In</a></div><div class="col-xs-1 col-md-1" id="signup"><a href="/users/signup" style="text-decoration:none">Sign up</a></div></div><div class="row"><div class="col-xs-1 col-md-3"></div><div class="col-xs-10 col-md-6" id="logo"><img src="/images/logo.png" class="img-responsive center-block"></div><div class="col-xs-1 col-md-3"></div></div><div class="row"><div class="col-xs-1 col-md-3"></div><div class="col-xs-10 col-md-6"><form name="test" method="post" action="/"><input type="text" class="form-control" placeholder="Text input" name="query"></form></div><div class="col-xs-1 col-md-3"></div></div>'

    Object.keys(obj).forEach(function(e) {
        Object.values(obj).forEach(function(a) {

            arrOfTitles += '<h3>' + e + '</h3><p style="display:none">' + Object.values(obj) + '</p>';
        })


    })

    var data = `<div class="row"><div class="col-xs-1 col-md-3"></div><div class="col-xs-10 col-md-6"><p>${arrOfTitles}</p></div><div class="col-xs-1 col-md-3"></div></div>`
    var end = '</body></html>';

    var body = start + middle + data + end;
    // console.log(body)
    return body
}

module.exports = router;
