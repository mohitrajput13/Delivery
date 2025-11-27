import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import session from 'express-session';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import logger from './src/utils/logger.js';
import config from './src/config/config.js';
import routes from './src/routes/index.js';
import { stream } from './src/utils/logger.js';
import { errorHandler } from './src/middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = config.port || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(compression());
app.use(morgan('combined', { stream }));
app.use(session({
    secret: config.jwtSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

const uploadsDir = path.join(__dirname, '../uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));
app.use('/delivery', routes);

app.use(errorHandler);
mongoose.connect(config.mongoUri)
    .then(() => {
        logger.info('Connected to MongoDB');
        app.listen(PORT, "0.0.0.0", () => {
            logger.info(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        logger.error('MongoDB connection error:', error);
        process.exit(1);
    });

export default app;
