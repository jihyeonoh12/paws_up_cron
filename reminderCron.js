const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
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
            const currentDate = new Date();
            const today = `Expired. Due ${currentDate.toISOString().split('T')[0]}`
  
            // Send reminder only if reminder is set and date is in the future
            if (reminder === today) {
              const mailOptions = {
                from: "no-reply@pawsup.com",
                to: email,
                subject: `Vaccine Reminder: ${type}`,
                text: `Hello ${user.name.value},\n\nThis is a reminder that your dog's ${type} is expired today (${currentDate.toISOString().split('T')[0]}). Please schedule it promptly.\n\nBest regards,\nYour Vaccine Reminder Service`,
              };
  
              try {
                await transporter.sendMail(mailOptions);
                console.log(`Reminder sent for ${type} and ${reminder} to ${email}`);
              } catch (error) {
                console.error(`Failed to send reminder for ${type} to ${email}:`, error);
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
  sendReminders().catch(console.error);
