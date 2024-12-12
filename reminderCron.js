const express = require("express");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);


// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://paws-up-a1046.web.app", 
});

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});

// Express Setup
const app = express();
const port = process.env.PORT || 3000;

async function sendReminders() {
    const db = admin.database();
    const usersRef = db.ref("users");
  
    try {
      // Fetch all users
      const snapshot = await usersRef.once("value");
      const users = snapshot.val();
  
      // Iterate through each user
      for (const userId in users) {
        const user = users[userId];
  
        // Check if the user is subscribed
        if (user.isSubscribed?.value) {
          const email = user.email;
  
          // Check vaccines and send reminders
          user.vaccines.value.forEach(async (vaccine) => {
            const { type, reminder } = vaccine;
  
            // Send reminder only if reminder is set and date is in the future
            if (reminder === 'Expired today' || reminder === 'Time for first vaccine!') {
              const mailOptions = {
                from: "no-reply@pawsup.com",
                to: email,
                subject: `Vaccine Reminder: ${type}`,
                text: `Hello`,
              };
  
              try {
                await transporter.sendMail(mailOptions);
                console.log(`Reminder sent`);
              } catch (error) {
                console.error(`Failed`, error);
              }
            }
          });
        }
      }
    } catch (error) {
      console.error("Error fetching users or sending reminders:", error);
    }
  }
  
  // Execute the function
  // sendReminders().catch(console.error);

  // HTTP Endpoint to Trigger Reminders

  app.get("/", (req, res) => {
    res.status(200).send("Reminder Service is running!");
  });
  app.get("/trigger-reminders", async (req, res) => {
    try {
      // await sendReminders();
      console.log('test');
      res.status(200).send("Reminders sent!");
    } catch (error) {
      console.error("Error sending reminders:", error);
      res.status(500).send("Failed to send reminders.");
    }
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
