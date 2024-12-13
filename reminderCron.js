const express = require("express");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);


if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  throw new Error("GOOGLE_APPLICATION_CREDENTIALS_JSON is not set. Please set the environment variable.");
}

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();



// Express Setup
const app = express();
const port = process.env.PORT || 3000;


async function sendReminders() {
  const usersSnapshot = await db.collection("users").get();

    if (usersSnapshot.empty) {
      console.log("No users found.");
      return [];
    } else {
      // Extract user data
      const users = [];
      usersSnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });

      for (const user of users) {
        // const user = doc.data();
        if (user.isSubscribed) {
          let vaccinesDue = [];

          user.vaccines.forEach((vaccine) => {
            const { type, reminder } = vaccine;
            if (reminder === 'Expired today' || reminder === 'Time for first vaccine!') {
              vaccinesDue.push(`${type}: ${reminder}`);
            }
          });
   
        if (vaccinesDue.length > 0) {
          const emailBody = `Hello,
\n
Here are the upcoming vaccines due for ${user.name}: 
\n
${vaccinesDue.join("\n")}
Please ensure timely vaccinations for your pet's health!
\n
Best regards,
Paws-Up Team
        `;
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });

          const mailOptions = {
            from: 'no-reply@pawsup.com',
            to: user.email,
            subject: `Vaccine Reminder for ${user.name}`,
            text: emailBody,
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log(`Reminder sent for to ${user.email}`);
          } catch (error) {
            console.error(`Failed to send reminder for ${user.name}:`, error);
          }
        }
          
        }
      }
    }
}

  // HTTP Endpoint to Trigger Reminders
  app.get("/", (req, res) => {
    res.status(200).send("Reminder Service is running!");
  });

  app.get("/favicon.ico", (req, res) => {
    res.status(204).end(); // 204 = No Content
  });

  app.get("/trigger-reminders", async (req, res) => {
    try {
      await sendReminders();
      res.status(200).send(`Reminders sent!`);
    } catch (error) {
      console.error("Error sending reminders:", error);
      res.status(500).send("Failed to send reminders.");
    }
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
