// setup server and datastore client
'use strict';
const express = require('express');
const app = express();
//app.enable('trust proxy'); //Security
app.use(express.static('public')); //Allow static files

//setup db
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter)
// Set some defaults
db.defaults({ accounts: [] })
  .write();

//Start Server
const PORT = process.env.PORT || 8080;
app.listen(process.env.PORT || 8080, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
module.exports = app;

function updateAccount(object) {
  db.get('accounts')
    .find({ email: object.email })
    .assign({
      name: object.name,
      balance: object.balance,
      password: object.password,
      transactions: object.transactions
    })
    .write()
    .then(() => {
      console.log("Update Success");
      return true;
    });
}

function createAccount(object) {
  db.get('accounts')
    .push(object)
    .write();

  return object;
}

function getAllData() {
  return db.get('accounts').value();
}

function searchAccountByEmail(email) {
  return db.get('accounts')
    .find({ email: email })
    .value();
}

/*const account_data = {
  name: "Fritz",
  email: "Fritz@meee.com",
  balance: 0,
  password: "fritz",
  transactions: []
};*/

//console.log("Create: " + createAccount(account_data));
//console.log("All Data: " + getAllData());
//console.log("Search Data: " + searchAccountByEmail("Fritz@meee.com"));

//***************************** Routes *************************************/

app.get('/', function (req, res) {
  res
    .status(200)
    .set('Content-Type', 'text/plain')
    .send("Navigate to index.html")
    .end();
});

app.get('/account/create/:name/:email/:password', function (req, res) {

  const account_data = {
    name: req.params.name,
    email: req.params.email,
    balance: 0,
    password: req.params.password,
    transactions: []
  };

  createAccount(account_data)
  var msg = "success"
  var status = 200;

  res
    .status(status)
    .set('Content-Type', 'text/plain')
    .send(msg)
    .end();
});

app.get('/account/login/:email/:password', function (req, res) {

  var account = searchAccountByEmail(req.params.email);
  var msg = "";
  var status = "";
  
  if (typeof account != "undefined" && account != null) {
    if (req.params.password == account.password) {
      msg = account;
      status = 200;
    }
    else {
      msg = null;
      status = 404;
      console.log("Passwort not match");
    }
  }
  else {
    msg = "failed";
    status = 404;
  }

  res
    .status(status)
    .set('Content-Type', 'text/plain')
    .send(msg)
    .end();
});

/*
app.get('/account/get/:email', async (req, res, next) => {
  try {
    var results = await searchAccountByParamValue('email', req.params.email);
    var entities = results[0];
    var msg = "";
    var status = "";

    if (typeof entities != "undefined" && entities != null && entities.length != null && entities.length > 0) {
      msg = entities[0];
      status = 200;
    }
    else {
      msg = "failure";
      status = 404;
    }

    res
      .status(status)
      .set('Content-Type', 'text/plain')
      .send(msg)
      .end();
  }
  catch (error) {
    next(error);
  }
});

app.get('/account/deposit/:email/:amount', async (req, res, next) => {
  try {
    var results = await searchAccountByParamValue('email', req.params.email);
    var entities = results[0];
    var msg = "";
    var status = "";

    if (typeof entities != "undefined" && entities != null && entities.length != null && entities.length > 0) {
      entities[0].balance = Number(entities[0].balance) + Number(req.params.amount); //Add to balance
      entities[0].transactions.push({ type: "deposit", amount: req.params.amount }); //Add transaction to account
      insertOrUpdateAccount(entities[0]);
      msg = "success";
      status = 200;
    }

    else {
      msg = "failure";
      status = 404;
    }

    res
      .status(status)
      .set('Content-Type', 'text/plain')
      .send(msg)
      .end();
  }
  catch (error) {
    next(error);
  }
});

app.get('/account/withdraw/:email/:amount', async (req, res, next) => {
  try {
    var results = await searchAccountByParamValue('email', req.params.email);
    var entities = results[0];
    var msg = "";
    var status = "";

    if (typeof entities != "undefined" && entities != null && entities.length != null && entities.length > 0) {
      entities[0].balance = Number(entities[0].balance) - Number(req.params.amount); //Withdraw from balance
      entities[0].transactions.push({ type: "withdraw", amount: req.params.amount }); //Add transaction to account
      insertOrUpdateAccount(entities[0]);
      msg = "success";
      status = 200;
    }

    else {
      msg = "failure";
      status = 404;
    }

    res
      .status(status)
      .set('Content-Type', 'text/plain')
      .send(msg)
      .end();
  }
  catch (error) {
    next(error);
  }
});

app.get('/account/transactions/:email', async (req, res, next) => {
  try {
    const results = await searchAccountByParamValue('email', req.params.email);
    const entities = results[0];
    var msg = "";
    var status = "";

    if (typeof entities != "undefined" && entities != null && entities.length != null && entities.length > 0) {
      msg = entities[0].transactions; //return transactions array
      status = 200;
    }
    else {
      msg = "failure";
      status = 404;
    }

    res
      .status(status)
      .set('Content-Type', 'text/plain')
      .send(msg)
      .end();
  }
  catch (error) {
    next(error);
  }
});

app.get('/account/all', async (req, res, next) => {

  try {
    var results = await getAllData();
    var entities = results[0];
    var msg = "";
    var status = "";

    if (typeof entities != "undefined" && entities != null && entities.length != null && entities.length > 0) {
      msg = entities;
      status = 200;
    }
    else {
      msg = "failure";
      status = 404;
    }

    res
      .status(status)
      .set('Content-Type', 'text/plain')
      .send(msg)
      .end();
  }
  catch (error) {
    next(error);
  }
});

app.get('/account/balance/:email', async (req, res, next) => {
  try {
    const results = await searchAccountByParamValue('email', req.params.email);
    const entities = results[0];
    var msg = "";
    var status = "";

    if (typeof entities != "undefined" && entities != null && entities.length != null && entities.length > 0) {
      const balance = entities[0].balance;
      msg = balance.toString();
      status = 200;
    }
    else {
      msg = "failure";
      status = 404;
    }

    res
      .status(status)
      .set('Content-Type', 'text/plain')
      .send(msg)
      .end();
  }
  catch (error) {
    next(error);
  }
});*/
