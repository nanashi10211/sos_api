const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const helmet  = require('helmet');
const morgan = require('morgan');
const app = express();

// Routes
const userRoute = require('./routes/users');
const authRoute = require('./routes/auth');
const postRoute = require('./routes/posts');

dotenv.config();

mongoose.connect(process.env.MONGODB_URL, {useNewUrlParser: true, useUnifiedTopology: true},() => {
    console.log("Mongodb Connected");
});
// middleware
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));



// api middleware
app.use("/api/users",userRoute);
app.use("/api/auth",authRoute);
app.use("/api/posts",postRoute);


// 404 router
app.use('/',(req, res) => {
    res.status(404).json({error: "We Don't have that kind of services"});
});

// error handling middleware
app.use((error, req, res, next) => {
    res.status(error.httpStatusCode).json({error: error.message,status: error.httpStatusCode});
    console.log(error);
})


app.listen(process.env.PORT_NUMBER, () => {
    console.log('Backend server is running! on port ' + process.env.PORT_NUMBER);
});