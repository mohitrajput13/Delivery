import app from './app.js';
import config from './src/config/config.js';
import logger from './src/utils/logger.js';
import mongoose from 'mongoose';

const PORT = config.port || 3000;

mongoose.connect(config.mongoUri)
    .then(() => {
        logger.info('Connected to MongoDB');
        startServer();
    })
    .catch((error) => {
        logger.error('MongoDB connection error:', error);
        process.exit(1);
    });

function startServer() {
    app.listen(PORT, "0.0.0.0", () => {
        logger.info(`Server is running on http://localhost:${PORT}`);
    });
}