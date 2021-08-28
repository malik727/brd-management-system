const express = require("express");
const dotenv = require('dotenv');
const cors = require("cors");
const HttpException = require('./utils/HttpException.utils');
const errorMiddleware = require('./middleware/error.middleware');
const userRouter = require('./routes/user.route');
const brdRouter = require('./routes/brd.route');
const attachmentRouter = require('./routes/attachment.route');
const fileUpload = require('express-fileupload');

// General API Information
const api_version = "0.2";
const api_stability = "beta";
const api_name = "BRD Management API";
const api_status = "Active";


// Initialize the express framework
const app = express();

// Initialize environment variables
dotenv.config();

// Only parse requests of Content-Type: Application/JSON
app.use(express.json());
app.use(fileUpload());

// enabling cors for all requests by using cors middleware
app.use(cors());
app.options("*", cors());

const port = Number(process.env.PORT || 3331);

// API Information Endpoint
app.use('/api/info', (req, res, next) => {
    res.status(200).json({
        "API Name": api_name,
        "Version": `v${api_version} ${api_stability}`,
        "Status": api_status
    });
});

// User Endpoints of API
app.use(`/api/v${api_version}/users`, userRouter);
// BRD Endpoints of API
app.use(`/api/v${api_version}/brds`, brdRouter);
// Attachment Endpoints of API
app.use(`/api/v${api_version}/attachments`, attachmentRouter);

// 404 error
app.all('*', (req, res, next) => {
    const err = new HttpException(404, 'Endpoint Not Found');
    next(err);
});

// Error middleware
app.use(errorMiddleware);

// starting the server
app.listen(port, () => {
    console.log(`${api_name} v${api_version} Running on Port [${port}]`)
});

module.exports = app;