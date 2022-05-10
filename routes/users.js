const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('../models/user');
const passport = require('passport');
const authenticate = require('../authenticate');
// const { authenticate } = require('passport/lib');
const app = require('../app');
var router = express.Router();
router.use(bodyParser.json());

//Get all users list
router.get('/', authenticate.verifyUser, (req, res, next)=> {    //authenticate.verifyUser validates through jwt token
  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 10
  }
  var myAggregate = User.aggregate();

  User.aggregatePaginate(myAggregate, options)                  //pagination with page and limit from req.query object.
  .then((users)=> {
    res.statusCode = 200;
    res.setHeader('Content-type', 'application/json');
    res.json(users);
  })
});

//Register new user
router.post('/signup', (req, res, next)=> {
  User.register(new User({username: req.body.username}),      //"register" for resgistering new user in the system.
  req.body.password, (err, user)=> {
    if(err){
      res.statusCode = 500;
      res.setHeader('Content-type', 'application/json');
      res.json({err: err});
    }else{
      if(req.body.firstname)
        user.firstname = req.body.firstname;
      if(req.body.lastname)
        user.lastname = req.body.lastname;
      if(req.body.email)
        user.email = req.body.email;
      if(req.body.address)
        user.address = req.body.address;
      if(req.body.mobileno)
        user.mobileno = req.body.mobileno;
      user.save((err, user)=> {
        if(err){
          res.statusCode = 500;
          res.setHeader('Content-type', 'application/json');
          res.json({err: err});
          return ;
        }
        passport.authenticate('local')(req, res, ()=> {
          res.statusCode = 200;
          res.setHeader('Content-type', 'application/json');
          res.json({success: true, status: "Registration Successful"});
        });
      });
    }
  });
});


//Login User
router.post('/login', passport.authenticate('local'), (req, res)=> {
  var token = authenticate.getToken({_id: req.user._id});                 //creating new jwt token whenver user login into the system
  res.statusCode = 200;
  res.setHeader('Content-type', 'application/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'});
});


//Update user details
router.put('/updateUser', authenticate.verifyUser, (req, res, next)=> {   //authenticate.verifyUser is validates through jwt token
  User.findByIdAndUpdate(req.user._id,
    {$set: req.body}, {new: true})
    .then((promo)=> {
      res.statusCode = 200;
      res.setHeader('Content-type', 'application/json');
      res.json(promo);
    }, err => next(err))
    .catch(err => next(err));
});

//Search with single key, token and pagination
router.get('/getSpecific', authenticate.verifyUser, (req, res, next)=> {
  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 2
  }
  let aggregateMatch = [];
  let match = {};
  if(req.query.firstname){
    match.firstname = req.query.firstname;
  }else if(req.query.lastname){
    match.lastname = req.query.lastname;
  }else if(req.query.email){
    match.email = req.query.email;
  }else if(req.query.address){
    match.address = req.query.address
  }else if(req.query.mobileno){
    match.mobileno = req.query.mobileno
  }
  aggregateMatch.push({$match: match});                         // this will find specific result from our user collection

  var myAggregate = User.aggregate(aggregateMatch);

  User.aggregatePaginate(myAggregate, options)                  //pagination with page and limit from req.query object.
  .then((users)=> {
    res.statusCode = 200;
    res.setHeader('Content-type', 'application/json');
    res.json(users);
  })
})


module.exports = router;
