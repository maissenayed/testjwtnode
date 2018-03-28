var express = require('express');
var router = express.Router();


var jwt = require('jsonwebtoken');
var _ = require("lodash");

var passport = require("passport");
var passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;


var users = [
    {
        id: 1,
        name: 'jonathanmh',
        password: '%2yx4'
    },
    {
        id: 2,
        name: 'test',
        password: 'test'
    }
];
var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = 'thisISvERYsECRET';

var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
    console.log('payload received', jwt_payload);
    // usually this would be a database call:
    var user = users[_.findIndex(users, {id: jwt_payload.id})];
    if (user) {
        next(null, user);
    } else {
        next(null, false);
    }
});

passport.use(strategy);
/* GET home page. */
router.get('/', function(req, res, next) {
    res.json({message: "Express is up!"});
});
router.post("/login", function(req, res) {
    if(req.body.name && req.body.password){
        var name = req.body.name;
        var password = req.body.password;
    }
    // usually this would be a database call:
    var user = users[_.findIndex(users, {name: name})];
    if( ! user ){
        res.status(401).json({message:"no such user found"});
    }

    if(user.password === req.body.password) {
        // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
        var payload = {id: user.id};
        var token = jwt.sign(payload, jwtOptions.secretOrKey);
        res.json({message: "ok", token: token});
    } else {
        res.status(401).json({message:"passwords did not match"});
    }
});
router.get("/secret", passport.authenticate('jwt', { session: false }), function(req, res){
    res.json("Success! You can not see this without a token");
});
module.exports = router;
