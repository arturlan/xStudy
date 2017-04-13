var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
const pgp = require('pg-promise')();
var fetch = require('node-fetch');
var request = require('request');
var $ = require("jquery");
var knex = require('../db/knex');
/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

//API url
var url = 'https://api.stackexchange.com/2.2/';
var searchUrlAppend = 'search?order=desc&sort=votes&site=stackoverflow&key=TvlWJpaYOVpnlNYsIrThqg((&intitle=';

var questionAnswerUrlAppend = '/answers?site=stackoverflow&key=TvlWJpaYOVpnlNYsIrThqg((&filter=withbody';


router.get('/signup', function(req, res, next) {
    res.render('signup');
});

function validUser(data) {
    return typeof data.name == 'string' &&
        data.email.trim() != '' &&
        data.password.trim() != '';
}

router.post('/signup', function(req, res, next) {
    if (validUser(req.body)) {
        const user = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        };
        bcrypt.hash(user.password, 10, function(err, hash) {
            knex('client')
                .insert({ name: user.name, email: user.email, password: hash }, 'id')
                .then(function(ids) {
                    const id = ids[0];
                    res.redirect(`/users/signedin/${id}`);
                })
        })

    } else {
        res.status(500);
        res.render('error', {
            message: 'Invalid sign up'
        })
    }
});

router.get('/signedin/:id', function(req, res, next) {
    const userid = req.params.id;
    console.log('this is my userid  ' + userid);
    knex('client')
        .where('id', userid)
        .then(user => {
            res.render('signedin', { user: user });
            // res.redirect('/signedin/:id', user.id)
            /****************************************/
            /****************************************/

        })

});

router.post('/signedin', function(req, res, next) {
    // const userid = req.params.id;
    // // console.log(userid);
    // knex('client')
    //     .where('id', userid)
    //     .then(user => {
    //         // res.render('signedin', { user: user });

    //     })
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
            // console.log(Object.values(obj));
            var render = renderingHtml(obj);
            res.send(render);
            /****************************************/
            // res.render('signedin', { obj: render });
            // console.log(obj);
            /****************************************/
        }

    })

});

var renderingHtml = function(obj) {
    var arrOfTitles = '<h1 style="color: red">All possible answers:</h1>';
    var css = '#login {text-align: right; } #header {margin-top: 30px;} h1, h5, h3 {font-family: "Libre Franklin", sans-serif;}';
    var jq = '$(document).ready(function() {$("h3").click(function () {var $stext = $(this).next("h5").stop(true, true);if ( $stext.is( ":hidden" ) ) {$stext.slideDown(300);} else {$stext.hide();}});});'
    var start = '<!DOCTYPE html><html><head><title>Results</title><link href="https://fonts.googleapis.com/css?family=Josefin+Sans|Libre+Franklin" rel="stylesheet"><link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous"><script src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4="crossorigin="anonymous"></script><script>' + jq + '</script></head><style>' + css + '</style><body>';
    var middle = '<div class="row" id="header"><div class="col-xs-6 col-md-6"></div><div class="col-xs-2 col-md-2"></div><div class="col-xs-1 col-md-1"><a href="/users/28/yourlist" style="text-decoration:none; color:black">Your list</a></div><div class="col-xs-1 col-md-1" id="signup"><a href="/users/28/addtolist" style="text-decoration:none; color: black">Add to list</a></div><div class="col-xs-1 col-md-1" id="login"><p style="color: red">Bill Murray</p></div><div class="col-xs-1 col-md-1" id="signup"><a href="/" style="text-decoration:none">Log out</a></div></div><div class="row"><div class="col-xs-1 col-md-3"></div><div class="col-xs-10 col-md-6" id="logo"><img src="/images/logo.png" class="img-responsive center-block"></div><div class="col-xs-1 col-md-3"></div></div><div class="row"><div class="col-xs-1 col-md-3"></div><div class="col-xs-10 col-md-6"><form name="test" method="post" action="/users/signedin"><input type="text" class="form-control" placeholder="Text input" name="query"></form></div><div class="col-xs-1 col-md-3"></div></div>'

    Object.keys(obj).forEach(function(e) {
        Object.values(obj).forEach(function(a) {
            // console.log(a);
            arrOfTitles += '<h3>' + e + '</h3><h5 style="display:none">' + a + '<br><hr><hr>' + '</h5>';
        })


    })

    var data = `<div class="row"><div class="col-xs-1 col-md-3"></div><div class="col-xs-10 col-md-6"><p>${arrOfTitles}</p></div><div class="col-xs-1 col-md-3"></div></div>`
    var end = '</body></html>';

    var body = start + middle + data + end;
    // console.log(body)
    return body
}

/*add to list*/

router.get('/:id/addtolist', function(req, res, next) {
    const userid = req.params.id;

    knex('client')
        .where('id', userid)
        .then(user => {
            res.render('addtolist', { user: user });
        })
});

router.post('/:id/addtolist', function(req, res, next) {
    const userid = req.params.id;

    knex('question')
        .insert({ question: req.body.question, answer: req.body.answer, client_Id: userid }, 'client_Id')
        .then(id => {
            knex('client')
                .where('id', userid)
                .then(user => {
                    res.render('signedin', { user: user });
                })
        })
});

/* your list */
router.get('/:id/yourlist', function(req, res, next) {
    const userid = req.params.id;

    knex('client')
        .where('id', userid)
        .then(user => {
            // res.render('yourlist', { user: user });
            knex('question')
                .where('client_Id', userid)
                .then(questions => {
                    res.render('yourlist', { user: user, questions: questions });
                })
        })
});


/*edit a question */
router.get('/:id/edit/:qid', function(req, res, next) {
    const userid = req.params.id;
    const qid = req.params.qid;
    knex('client')
        .select()
        .where('id', userid)
        .then(user => {
            // res.render('yourlist', { user: user });
            knex('question')
                .where('id', qid)
                .then(questions => {
                    res.render('edit', { user: user, questions: questions });
                })
        })
});

router.put('/:id/yourlist/:qid', function(req, res, next) {
    const userid = req.params.id;
    const qid = req.params.qid;
    knex('client')
        .where('id', userid)
        .then(user => {
            // res.render('yourlist', { user: user });
            knex('question')
                .where('id', qid)
                .update({
                    question: req.body.question,
                    answer: req.body.answer
                })
                .then(questions => {
                    res.redirect('/users/28/yourlist');
                })
        })
});

/*delete a question */
router.delete('/:id/delete/:qid', function(req, res, next) {
    const userid = req.params.id;
    const qid = req.params.qid;
    knex('client')
        .where('id', userid)
        .then(user => {
            // res.render('yourlist', { user: user });
            knex('question')
                .where('id', qid)
                .del()
                .then(questions => {
                    res.redirect('/users/28/yourlist');
                })
        })
});


// log in
router.get('/login', function(req, res, next) {
    res.render('login');
});

router.post('/login', function(req, res, next) {
    knex('client')
        .where('email', req.body.email)
        .then(user => {
            user = user[0];
            bcrypt.compare(req.body.password, user.password, function(err, comparing) {
                // console.log(req.body.password);
                if (comparing) {
                    res.redirect(`/users/signedin/${user.id}`);
                } else {
                    res.send('Authorization failed: Invalid email/password');
                }
            })
        });
});

module.exports = router;
