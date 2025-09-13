// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');
const { MailerSend, EmailParams } = require('mailersend');



const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// DynamoDB setup
const client = new DynamoDBClient({ region: 'us-west-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = 'Messages'; // replace with your table name

// MailerSend setup
const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY,
});

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

// Send emails to all addresses
// Send emails to all addresses
// correct require

// MailerSend setup


app.post('/send-emails', async (req, res) => {
  try {
    const emails = await getAllEmails();

    if (emails.length === 0) {
      return res.json({ success: true, message: 'No emails to send' });
    }

    await Promise.all(
      emails.map(email => {
        const params = new EmailParams()
          .setFrom({ email: 'admin@test-ywj2lpnwr2mg7oqz.mlsender.net', name: 'Couponz' }) // object with email + name
          .setTo([{ email}])  // array of objects
          .setSubject('Heyh!gggggggggggg! fhrom Couponz!')
          .setHtml('<h3>This is a ttesgt hemail sent using MailerSend API</h3>');

        return mailerSend.email.send(params); // correct send
      })
    );

    res.json({ success: true, message: `Sent emails to ${emails.length} recipients` });
  } catch (err) {
    console.error('Error sending emails:', err);
    res.status(500).json({ success: false, message: 'Failed to send emails' });
  }
});




// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
