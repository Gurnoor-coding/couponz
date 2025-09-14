// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

const app = express();
const PORT = 5000;


app.use(cors({ origin: '*' })); 

app.use(express.json());

// DynamoDB setup
const client = new DynamoDBClient({ region: 'us-west-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = 'Messages'; // replace with your table name

app.use((req, res, next) => {
  console.log("Lambda received:", req.method, req.path, req.body);
  next();
});
// SES setup
const sesClient = new SESClient({ region: 'us-west-1' }); // same region as your verified domain

// Test route
app.get('/', (req, res) => {
  res.send('Welcome to Couponz backend!');
});

// Add email to database
app.post('/emails', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  const id = uuidv4();
  try {
    await ddbDocClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: { id, mail: email },
      })
    );

    res.json({ success: true, message: 'Email saved' });
  } catch (err) {
    console.error('Error saving email:', err);
    res.status(500).json({ success: false, message: 'Failed to save email' });
  }
});

// Fetch all emails
async function getAllEmails() {
  const emails = [];
  let ExclusiveStartKey;

  try {
    do {
      const result = await ddbDocClient.send(
        new ScanCommand({ TableName: TABLE_NAME, ProjectionExpression: 'mail', ExclusiveStartKey })
      );

      emails.push(...result.Items.map(item => item.mail));
      ExclusiveStartKey = result.LastEvaluatedKey;
    } while (ExclusiveStartKey);

    return emails;
  } catch (err) {
    console.error('Error fetching emails:', err);
    return [];
  }
}

// Send emails to all addresses via SES
app.post('/send-emails', async (req, res) => {
  const { message } = req.body; // get message from frontend
  try {
    const emails = await getAllEmails();
    if (emails.length === 0) {
      return res.json({ success: true, message: 'No emails to send' });
    }

    await Promise.all(
      emails.map(async (email) => {
        const params = {
          Source: process.env.SES_VERIFIED_EMAIL,
          Destination: { ToAddresses: [email] },
          Message: {
            Subject: { Data: 'Hello from Couponz!' },
            Body: {
              Html: { Data: `<h3>${message || 'This is a test email sent using Amazon SES'}</h3>` },
            },
          },
        };

        await sesClient.send(new SendEmailCommand(params));
      })
    );

    res.json({ success: true, message: `Sent emails to ${emails.length} recipients` });
  } catch (err) {
    console.error('Error sending emails:', err);
    res.status(500).json({ success: false, message: 'Failed to send emails' });
  }
});

module.exports = app;
