let mysql = require("mysql2");
let db = mysql.createConnection({
    host: "192.168.0.50",
    user: "chatapp",
    password: "1111",
    database: "account"
});
db.connect();

module.exports = db;