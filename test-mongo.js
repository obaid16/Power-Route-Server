const mongoose = require('mongoose');

const uri = "mongodb+srv://obaidullahshaikh07_db_user:ubaid23@poweroute1.msqmek2.mongodb.net/?appName=PoweRoute1";

console.log("Connecting to MongoDB...");
mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("✅ Successfully connected to MongoDB Atlas!");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Connection failed:", err.message);
    process.exit(1);
  });
