const router = require('express').Router();
const {next} = require('express');
const User = require('../models/User'); 
const bcrypt = require('bcrypt');   
const { check, validationResult, body} = require('express-validator');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

// REGISTER
router.post('/register',
[
    check('email').isEmail().trim().withMessage("Please Enter a valid Email").custom((value, {req}) => {
        if (value === "test@test.com") {
            throw new Error('This email address if forbidden');
        } 
        if (value !== value.toLowerCase()) {
            const error =  new Error("Email has to be a email format");
            error.httpStatusCode = 500;
            throw new Error(error);
        }
        return true;
    }),
    body('password', "Password have to at least 6 char long").trim().isLength({min: 6}),
    body('confirmPassword').custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error(`Your password dose not match `);
        }
        return true;
    })
]
, async (req,res,next) => {
    try {
        const errors = await validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        // generate hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

    
        // create a new user
        const newUser = new User({
            username: username,
            email: email,
            password: hashedPassword,
        });
        // save users and return respond
        const user = await newUser.save();
        res.status(201).send(user);
    }
    catch(error) {
        const errors = new Error(error);
        errors.message = "Internal Server Errors";
        errors.httpStatusCode = 500;
        return next(errors);
    }
});


// LOGIN
router.post('/login', 
body('email').isEmail().withMessage('Email is to a Email format'),
body('password').isString().withMessage('password is not in format'),
async (req, res,next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log("client ip is ",ip);
    try{

        const email = req.body.email;
        const password = req.body.password;
        const user = await User.findOne({email: `${email}`}).exec();
        if (!user) {
           const error = new Error("User Not found");
           error.httpStatusCode= 404;
           throw error;
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            // res.status(400).json('Wrong password');
            // return;
            const error = new Error("Invalid Information");
            error.httpStatusCode = 401;
            throw error;
        } else {
            const token = jwt.sign({
                email: user.email,
                userId: user._id.toString()
            },
            process.env.SECRET_KEY,
            {expiresIn: '1h'}
            );
            res.status(200).json({token: token, userId: user._id.toString()});
        }
    } 
    catch (error) {
        const errors = new Error(error);
        errors.httpStatusCode = 500;
        return next(errors);
    }
});
console.log("this is a ",process.env.SECRET_KEY);
module.exports = router;