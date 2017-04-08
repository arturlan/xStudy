var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs');
const pgp = require('pg-promise')();

var knex = require('../db/knex');
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


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
    console.log(userid);
    knex('client')
        .where('id', userid)
        .then(user => {
            res.render('signedin', { user: user });
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
                console.log(req.body.password);
                if (comparing) {
                    res.redirect(`/users/signedin/${user.id}`);
                } else {
                    res.send('Authorization failed: Invalid email/password');
                }
            })
        });
});

module.exports = router;
