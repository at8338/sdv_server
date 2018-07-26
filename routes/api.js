const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Users = require('../models/users');
const FaultLists = require('../models/faultlists');
const SettingsUser = require('../models/settings.user');
const jwt = require('jsonwebtoken')
const db ="mongodb://127.0.0.1:27017/AngularAuth_db"
// mongoose.Promise = global.Promise;

mongoose.connect(db, function(err){
    if(err){
        console.error('Error! ' + err)
    } else {
      console.log('Connected to mongodb')      
    }
});

function verifyToken(req, res, next) {
  if(!req.headers.authorization) {
    return res.status(401).send('Unauthorized request')
  }
  let token = req.headers.authorization.split(' ')[1]
  if(token === 'null') {
    return res.status(401).send('Unauthorized request')    
  }
  let payload = jwt.verify(token, 'secretKey')
  if(!payload) {
    return res.status(401).send('Unauthorized request')    
  }
  req.userId = payload.subject
  next()
}

// --------------------------
// gets
// --------------------------
router.get('/faultlists', function(req, res){
  console.log('get fault lists');
  FaultLists.find({})
  .exec(function(err, faults){
    if (err) {
      console.log('Error');
    } else {
      res.json(faults);
    }
  });
});

router.get('/users/:email', function(req, res){
  console.log('get username:' + req.params.email);
  let userData = req.params.email
  Users.findOne({email: userData})
  .exec(function(err, user){
    if (err) {
      console.log('Error');
    } else {
      if (user) {
        res.json(user);
        console.log('get username suscess');
      } else {
        console.log('empty');
      }
    }
  });
});


// --------------------------
// posts
// --------------------------
router.post('/register', (req, res) => {
  let userData = req.body
  let user = new Users(userData)
  user.save((err, registeredUser) => {
    if (err) {
      console.log(err)      
    } else {
      let payload = {subject: registeredUser._id}
      let token = jwt.sign(payload, 'secretKey')
      res.status(200).send({token})
    }
  })
})

router.post('/login', (req, res) => {
  let userData = req.body
  Users.findOne({email: userData.email}, (err, user) => {
    if (err) {
      console.log(err)    
    } else {
      if (!user) {
        res.status(401).send('Invalid Email')
      } else 
      if ( user.password !== userData.password) {
        res.status(401).send('Invalid Password')
      } else {
        let payload = {subject: user._id}
        let token = jwt.sign(payload, 'secretKey')
        res.status(200).send({token})
        console.log('login success')
      }
    }
  })
})

router.post('/faultlists', (req, res) => {
  console.log(req.body)
  let faultlistsData = req.body
  let faultlists = new FaultLists(faultlistsData)
  faultlists.save((err, data) => {
    if (err) {
      console.log(err)
    } else {
      let payload = {subject: data._id}
      let token = jwt.sign(payload, 'secretKey')
      res.status(200).send({token})
    }
  })
})

// --------------------------
// put
// --------------------------
router.put('/faultlists/:id', function(req, res){
  console.log('update fault lists');
  FaultLists.findByIdAndUpdate(req.params.id,
    {
      $set: {
        maker: req.body.maker,
        factory: req.body.factory,
        machine: req.body.machine, 
        sensor: req.body.sensor,
        etype: req.body.etype,
        elevel: req.body.elevel
      }
    },
    {
      new: true
    },
    function(err, updatedFault) {
      if (err) {
        res.send('Error updateing faultlists');
      } else {
        res.json(updatedFault);
      }
    }
  );
});


router.put('/settings.user/:email', function(req, res){
  console.log('update user data');
  SettingsUser.findOneAndUpdate(req.params.email,
    {
      $set: {
        fullname: req.body.fullname, 
        email: req.body.email,
        password: req.body.password,
        repeatpassword: req.body.repeatpassword
      }
    },
    {
      new: true
    },
    function(err, updatedUser) {
      if (err) {
        res.send(err);
        console.log('Error updateing user data');
      } else {
        res.json(updatedUser);
        console.log('Success updateing user data');
      }
    }
  );
});


// --------------------------
// delete
// --------------------------
router.delete('/faultlists/:id', function(req, res){
  console.log('delete a fault');
  FaultLists.findByIdAndRemove(req.params.id, function(err, deleteedFault) {
    if (err) {
      res.send('Error deleting fault');
    } else {
      res.json(deleteedFault);
    }
  });
});




module.exports = router;