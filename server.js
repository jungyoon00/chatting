const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");
const app = express();
const port = 3001;

const db = require("./lib/db");
const sessionOption = require("./lib/sessionOption");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

app.use(express.static(path.join(__dirname, "/build")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

let MySQLStore = require("express-mysql-session")(session);
let sessionStore = new MySQLStore(sessionOption);

app.use(session({
    key: "session_cookie_name",
    secret: "~",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
}))

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/build/index.html"));
})

app.get("/authcheck", (req, res) => {
    const sendData = { isLogin: "" };
    if (req.session.is_logined) {
        sendData.isLogin = "True";
    } else {
        sendData.isLogin = "False";
    }
    res.send(sendData);
})

app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        res.redirect('/');
    });
})

app.post("/login", (req, res) => {
    const userID = req.body.userID;
    const userPW = req.body.userPW;
    const sendData = { isLogin: "" };

    if (userID && userPW) {
        db.query("SELECT * FROM accounts WHERE userID = ?", [userID], function (err, results, fields) {
            if (err) throw err;
            if (results.length > 0) {
                bcrypt.compare(userPW, results[0].userPW, (err, result) => {

                    if (result === true) {
                        req.session.is_logined = true;
                        req.session.userName = userID;
                        req.session.save(function () {
                            sendData.isLogin = "True";
                            res.send(sendData);
                        });
                    } else {
                        sendData.isLogin = "Your password is invalid.";
                        res.send(sendData);
                    }
                })
            } else {
                sendData.isLogin = "Your id is invalid.";
                res.send(sendData);
            }
        });
    } else {
        sendData.isLogin = "Please enter your id and password.";
        res.send(sendData);
    }
});

app.post("/signin", (req, res) => {
    const getID = req.body.getID;
    const getPW = req.body.getPW;
    const getPWCheck = req.body.getPWCheck;

    const sendData = { isSuccess: "" };

    if (getID && getPW && getPWCheck) {
        db.query('SELECT * FROM accounts WHERE userID = ?', [getID], function (err, results, fields) {
            if (err) throw err;
            if (results.length <= 0 && getPW === getPWCheck) {
                const hasedgetPW = bcrypt.hashSync(getPW, 10);
                db.query('INSERT INTO accounts (userID, userPW) VALUES (?, ?)', [getID, hasedgetPW], function (err, data) {
                    if (err) throw err;
                    req.session.save(function () {
                        sendData.isSuccess = "True";
                        res.send(sendData);
                    });
                });
            } else if ( getPW !== getPWCheck) {
                sendData.isSuccess = "The passwords you entered are different.";
                res.send(sendData);
            } else {
                sendData.isSuccess = "This ID already exists."
                res.send(sendData);
            }
        });
    } else {
        sendData.isSuccess = "Please enter your id and password.";
        res.send(sendData);
    }
});

app.listen(port, () => {
    console.log(`App Listening at http://192.168.0.50:${port}`);
})