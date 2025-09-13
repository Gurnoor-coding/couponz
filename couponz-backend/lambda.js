// backend/lambda.js
const awsServerlessExpress = require('aws-serverless-express');
const expressapp = require('./server'); // import your Express app

const server = awsServerlessExpress.createServer(expressapp);

exports.handler = (event, context) => {
    awsServerlessExpress.proxy(server, event, context);
};
