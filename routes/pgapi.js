const express = require("express");
const router = express.Router();
const Users = require("../models/users");
const FaultLists = require("../models/faultlists");
const SettingsUser = require("../models/settings.user");
const jwt = require("jsonwebtoken");

var pgp = require("pg-promise")(/*options*/);
const cn = {
  host: "127.0.0.1",
  port: 5432,
  database: "sdv_server",
  user: "postgres",
  password: "Biomehanika0"
};
const db = pgp(cn);
console.log("Connected to pg db");

// --------------------------
// gets
// --------------------------
router.get("/faultlists", function(req, res) {
  console.log("GET /faultlists");

  db.any("SELECT * FROM faultlists")
    .then(data => {
      console.log("GET suscess");
      res.json(data);
    })
    .catch(error => {
      console.log("ERROR:", error);
      res.status(500).send("error");
    });
});

router.get("/users/:email", function(req, res) {
  console.log("GET /users/:email", req.params.email);

  db.one(
    "SELECT * FROM users WHERE email = $1",
    req.params.email
  ) /* email LIKE '%$1#%' */
    .then(data => {
      console.log("GET suscess");
      res.json(data);
    })
    .catch(error => {
      console.log("ERROR:", error);
      res.status(500).send("error");
    });
});

router.get("/sidebardate", function(req, res) {
  console.log("GET /sidebardate");

  db.any("SELECT * FROM sidebardate")
    .then(data => {
      console.log("GET suscess");
      res.json(data);
    })
    .catch(error => {
      console.log("ERROR:", error);
      res.status(500).send("error");
    });
});

// --------------------------
// posts
// --------------------------
router.post("/register", (req, res) => {
  let q = new Users(req.body);
  console.log("POST /register", q);

  db.one(
    "INSERT INTO users " +
      "(fullname, email, password, repeatpassword) " +
      "VALUES($1, $2, $3, $4) " +
      "RETURNING id",
    [q.fullname, q.email, q.password, q.repeatpassword]
  )
    .then(data => {
      let payload = { subject: data.id };
      let token = jwt.sign(payload, "secretKey");

      db.none("UPDATE users SET token = $1 WHERE id = $2", [token, data.id])
        .then(() => {
          console.log("register success");
          res.status(200).send({ token });
        })
        .catch(error => {
          console.log("ERROR:", error);
          res.status(500).send("error");
        });
    })
    .catch(error => {
      console.log("ERROR:", error);
      res.status(500).send("error");
    });
});

router.post("/login", (req, res) => {
  let q = new Users(req.body);
  console.log("POST /login" + q);

  db.one("SELECT * FROM users WHERE email = $1", q.email)
    .then(data => {
      if (!data) {
        res.status(401).send("Invalid Email");
      } else if (data.password !== q.password) {
        res.status(401).send("Invalid Password");
      } else {
        let payload = { subject: data.id };
        let token = jwt.sign(payload, "secretKey");

        db.none("UPDATE users SET token = $1 WHERE id = $2", [token, data.id])
          .then(() => {
            console.log("login success");
            res.status(200).send({ token });
          })
          .catch(error => {
            console.log("ERROR:", error);
            res.status(500).send("error");
          });
      }
    })
    .catch(error => {
      console.log("ERROR:", error);
      res.status(500).send("error");
    });
});

router.post("/faultlists", (req, res) => {
  let q = new FaultLists(req.body);
  console.log("INSERT /faultlists");

  db.one(
    "INSERT INTO faultlists " +
      "(maker, factory, machine, sensor, etype, elevel) " +
      "VALUES($1, $2, $3, $4, $5, $6) " +
      "RETURNING id",
    [q.maker, q.factory, q.machine, q.sensor, q.etype, q.elevel]
  )
    .then(data => {
      console.log("INSERT suscess");
      let payload = { subject: data.id };
      let token = jwt.sign(payload, "secretKey");
      res.status(200).send({ token });
    })
    .catch(error => {
      console.log("ERROR:", error);
      res.status(500).send("error");
    });
});

// --------------------------
// put
// --------------------------
router.put("/faultlists/:id", function(req, res) {
  let q = req.body;
  console.log("UPDATE /faultlists/:id=", req.params.id);

  db.result(
    "UPDATE faultlists " +
      "SET maker = $1, factory = $2, machine = $3, sensor = $4, etype = $5, elevel = $6 " +
      "WHERE id = $7",
    [q.maker, q.factory, q.machine, q.sensor, q.etype, q.elevel, req.params.id]
  )
    .then(result => {
      if (!result.rowCount) {
        console.log("ERROR: Request id Not Found");
        res.status(404).send("Request id Not Found");
      } else {
        console.log("UPDATE success");
        res.status(200).send("suscess");
      }
    })
    .catch(error => {
      console.log("ERROR:", error);
      res.status(500).send("error");
    });
});

router.put("/settings.user/:email", function(req, res) {
  let q = req.body;
  console.log("UPDATE /settings.user/:email=", req.params.email);

  db.result(
    "UPDATE users " +
      "SET fullname = $1, email = $2, password = $3, repeatpassword = $4 " +
      "WHERE email = $5",
    [q.fullname, q.email, q.password, q.repeatpassword, req.params.email]
  )
    .then(result => {
      if (!result.rowCount) {
        console.log("ERROR: Request id Not Found");
        res.status(404).send("Request id Not Found");
      } else {
        console.log("UPDATE success");
        res.status(200).send("suscess");
      }
    })
    .catch(error => {
      console.log("ERROR:", error);
      res.status(500).send("error");
    });
});

// --------------------------
// delete
// --------------------------
router.delete("/faultlists/:id", function(req, res) {
  console.log("DELETE /faultlists/:id=", req.params.id);

  db.result("DELETE FROM faultlists " + "WHERE id = $1", [req.params.id])
    .then(result => {
      if (!result.rowCount) {
        console.log("ERROR: Request id Not Found");
        res.status(404).send("Request id Not Found");
      } else {
        console.log("DELETE success:");
        res.status(200).send("suscess");
      }
    })
    .catch(error => {
      console.log("ERROR:", error);
      res.status(500).send("error");
    });
});

module.exports = router;
