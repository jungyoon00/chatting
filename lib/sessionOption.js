let options = {
    host: "172.30.1.6",
    user: "chatapp",
    password: "1111",
    database: "account",
    port: 3306,

    clearExpired: true,
    checkExpirationInterval: 10000,
    expiration: 1000 * 60 * 60 * 2,
};

module.exports = options;