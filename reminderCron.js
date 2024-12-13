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

// async function fetchUsers() {
//   try {
//     const usersSnapshot = await db.collection("users").get(); // Fetch all documents in "users" collection
//     if (usersSnapshot.empty) {
//       console.log("No users found.");
//       return [];
//     }

//     const users = [];
//     usersSnapshot.forEach((doc) => {
//       users.push({ id: doc.id, ...doc.data() }); // Add document ID and data to the array
//     });

//     return users;
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     throw error;
//   }
// }

async function sendReminders() {
  const usersSnapshot = await db.collection("users").get();

    if (usersSnapshot.empty) {
      console.log("No users found.");
      return [];
    }

    const users = [
      {
        name: { value: "Bibi" },
        email: "user@example.com",
        isSubscribed: { value: true },
        vaccines: {
          value: [
            { type: "Rabies", date: "2024-12-03", reminder: "2024-12-01" },
            { type: "Distemper", date: "2023-12-01", reminder: "2023-11-29" }
          ]
        }
      }
    ];
    return usersSnapshot;

    // usersSnapshot.forEach((doc) => {
    //   users.push({ ...doc.data() }); // Add document ID and data to the array
    // });


  // const usersSnapshot = await db.collection("users").where("isSubscribed", "==", true).get();

  // for (const doc of usersSnapshot.doc) {
  //   const user = doc.data();
  //   if (user.isSubscribed) {
  //     for (const vaccine of user.vaccines) {
  //       const { type, reminder } = vaccine;

  //       if (reminder === 'Expired today' || reminder === 'Time for first vaccine!') {
  //         const transporter = nodemailer.createTransport({
  //           service: "gmail",
  //           auth: {
  //             user: process.env.EMAIL_USER,
  //             pass: process.env.EMAIL_PASS,
  //           },
  //         });

  //         const mailOptions = {
  //           from: 'no-reply@pawsup.com',
  //           to: user.email,
  //           subject: `Vaccine Reminder: ${type}`,
  //           text: `Hello ${user.name},\n\nYour dog's ${type} vaccine is due.`,
  //         };

  //         try {
  //           await transporter.sendMail(mailOptions);
  //           console.log(`Reminder sent for ${type} to ${user.email}`);
  //         } catch (error) {
  //           console.error(`Failed to send reminder for ${type}:`, error);
  //         }
  //       }
  //     }
  //   }
  // }
}



// async function sendReminders() {
//     try {
//       // Fetch all users
//       console.log('test3');

//       const usersSnapshot = await db.collection("users").get();
//       // const snapshot = await usersRef.once("value");
//       if (usersSnapshot.empty) {
//         console.log("No data available at the 'users' reference.");
//         return [];
//       }
//       const users = [];

  
//       // Iterate through each user
//       // for (const userId in users) {
//       //   const user = users[userId];
  
//       //   console.log('user');
//       //   console.log(user);
//       //   // Check if the user is subscribed
//       //   if (user.isSubscribed?.value) {
//       //     const email = user.email;
//       //     console.log('email');
//       //     console.log(email);
  
//       //     // Check vaccines and send reminders
//       //     user.vaccines.value.forEach(async (vaccine) => {
//       //       const { type, reminder } = vaccine;
  
//       //       // Send reminder only if reminder is set and date is in the future
//       //       if (reminder === 'Expired today' || reminder === 'Time for first vaccine!') {
//       //         const mailOptions = {
//       //           from: "no-reply@pawsup.com",
//       //           to: email,
//       //           subject: `Vaccine Reminder: ${type}`,
//       //           text: `Hello`,
//       //         };
  
//       //         try {
//       //           await transporter.sendMail(mailOptions);
//       //           console.log(`Reminder sent`);
//       //         } catch (error) {
//       //           console.error(`Failed`, error);
//       //         }
//       //       }
//       //     });
//       //   }
//       // }
//     } catch (error) {
//       console.error("Error fetching users or sending reminders:", error);
//     }
//   }
  
  // Execute the function
  // sendReminders().catch(console.error);

  // HTTP Endpoint to Trigger Reminders

  app.get("/", (req, res) => {
    res.status(200).send("Reminder Service is running!");
  });

  app.get("/favicon.ico", (req, res) => {
    res.status(204).end(); // 204 = No Content
  });

  app.get("/trigger-reminders", async (req, res) => {
    try {
      const test = await sendReminders();
      console.log("Users data:", JSON.stringify(test, null, 2));
      res.status(200).send(`Reminders sent! ${JSON.stringify(test, null, 2)}`);
    } catch (error) {
      console.error("Error sending reminders:", error);
      res.status(500).send("Failed to send reminders.");
    }
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
