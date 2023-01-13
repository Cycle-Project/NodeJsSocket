const jwt = require("jsonwebtoken");

const config = process.env;

const auth = (req, res, next) => {
    const token =
        req.body.token || req.query.token || req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    try {
        const decoded = jwt.verify(token, config.TOKEN_KEY);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
    return next();
};

const socketAuth = async (socket, next) => {
    const token = socket.handshake.query.token;
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY)
        // add user data to socket
        socket.user = decoded
        next()
    } catch (err) {
        next(new Error('Authentication error'))
    }
}

module.exports = { auth, socketAuth } 