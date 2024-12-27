import mongoose from 'mongoose';

const connectToDatabase = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  await mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

export default connectToDatabase;
