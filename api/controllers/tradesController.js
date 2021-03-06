'use strict';

var jwt = require('jsonwebtoken');

var User = require('../models/user');
var Trade = require('../models/trade');
var Book = require('../models/book');

var Config = require('../../config/secret');
var Helpers = require('../helpers');

function TradesController() { }

TradesController.propose = function (req, res) {
  var token = Helpers.getToken(req.headers);
  if (!token)
    return res.status(403).send({
      success: false,
      msg: 'No token provided.'
    });

  var decoded = jwt.decode(token, Config.secret);

  const userQuery = User.findOne({
    'email': decoded._doc.email
  }).exec();

  console.log(userQuery);

  userQuery.then(function (user) {
    if (!user)
      return res.status(403).send({
        success: false,
        msg: 'Authentication failed. User not found.'
      });

    var trade = new Trade({
      _book: req.body.bookId,
      _requester: user._id,
      completed: false,
      accepted: false
    });

    trade.save(function (err) {
      if (err)
        throw err;

      Book.findOne({ _id: req.body.bookId }, function (err, book) {
        book.trades.push(trade);
        book.save(function (err) {
          if (err)
            throw err;

          res.json({ success: true });
        });
      })
    })
  })
  .catch(function(){
    return res.status(500).send({
      success: false,
      msg: error
    });
  });
}

TradesController.getOfBook = function (req, res) {
  var token = Helpers.getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, Config.secret);
    User.findOne({
      'email': decoded._doc.email
    }, function (err, user) {
      if (err)
        throw err;

      if (!user) {
        return res.status(403).send({ success: false, msg: 'Authentication failed. User not found.' });
      }
      else {
        Trade.find({ _book: req.params.bookId })
          .populate('_requester')
          .exec(function (err, trades) {
            if (err)
              throw err;

            res.json({ success: true, trades: trades });
          });
      }
    });
  }
  else {
    return res.status(403).send({ success: false, msg: 'No token provided.' });
  }
}

TradesController.destroy = function (req, res) {
  var token = Helpers.getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, Config.secret);
    User.findOne({
      'email': decoded._doc.email
    }, function (err, user) {
      if (err)
        throw err;

      if (!user) {
        return res.status(403).send({ success: false, msg: 'Authentication failed. User not found.' });
      }
      else {
        Trade.remove({ _id: req.params.tradeId }, function (err) {
          if (err)
            throw err;

          return res.json({ success: true });
        });
      }
    });
  }
  else {
    return res.status(403).send({ success: false, msg: 'No token provided.' });
  }
}

TradesController.accept = function (req, res) {
  var token = Helpers.getToken(req.headers);
  if (token) {
    var decoded = jwt.decode(token, Config.secret);
    User.findOne({
      'email': decoded._doc.email
    }, function (err, user) {
      if (err)
        throw err;

      if (!user) {
        return res.status(403).send({ success: false, msg: 'Authentication failed. User not found.' });
      }
      else {
        Trade.findOne
          (
            { _id: req.params.tradeId },
            function (err, trade) {
              if (err)
                throw err;

              trade.completed = true;
              trade.accepted = true;
              trade.save();

              Book.update
                (
                  { _id: trade._book },
                  { traded: true },
                  function (err) {
                    if (err)
                      throw err;

                    return res.json({ success: true });
                  }
                );
            }
          );
      }
    });
  }
  else {
    return res.status(403).send({ success: false, msg: 'No token provided.' });
  }
}

module.exports = TradesController;
