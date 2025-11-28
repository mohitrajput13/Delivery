import dotenv from 'dotenv';
dotenv.config();
const config = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGODB_URI || 'mongodb+srv://mohitrajputntf:Admin%4012345@cluster0.lyrp7km.mongodb.net/ai-voice',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-secret-key',
    logLevel: process.env.LOG_LEVEL || 'info',
    FRONTEND_URL:process.env.FRONTEND_URL,
    email: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        password: process.env.EMAIL_PASSWORD,
        from: process.env.EMAIL_FROM || 'noreply@yourdomain.com'
    },
};
export default config;