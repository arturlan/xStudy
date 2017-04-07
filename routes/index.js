var express = require('express');
var router = express.Router();

var knex = require('../db/knex');

/* GET home page. */
router.get('/', function(req, res, next) {
    knex('question')
        .select()
        .then(questions => {
            console.log(questions);
            res.render('index', { questions: questions });
        })

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
    	knex('client')
    	.insert(user, 'id')
    	.then(function(ids) {
            const id = ids[0];
    		res.redirect(`/signedin/${id}`);

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
        console.log(user);
        res.render('signedin', { user: user});
    })
    
});

module.exports = router;
