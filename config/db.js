const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Includes error handling and retry logic
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, {
      // Remove deprecated options
      // useNewUrlParser and useUnifiedTopology are no longer needed in Mongoose 6+
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Retry connection after 5 seconds
    console.log('Retrying database connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
