const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();




module.exports = (req, res, next) => {
    // const token = req.get('Autorization').split(' ')[1];
    const token = req.body.token;
    let decodedToken;

    try {
        decodedToken = jwt.verify(token,process.env.SECRET_KEY);
    } catch (error) {
        error.httpStatusCode = 501;
        next(error);
    }
    if (!decodedToken) {
        const error = new Error('Not Autenticated');
        error.httpStatusCode = 401;
        next(error);
    }
    req.userId = decodedToken.userId; 
    console.log(decodedToken.userId);
    next();
}





