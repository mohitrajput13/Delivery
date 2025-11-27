import { z } from 'zod';

const addressSchema = z.object({
    addressLine: z.string().min(1, 'Address line is required'),
    lat: z.number(),
    lng: z.number()
});

const registerSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    country_code: z.string().min(1, 'Country code is required'),
    mobile: z.string().min(1, 'Mobile number is required'),
    email: z.string().email('Invalid email format').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    address: z.array(addressSchema).optional()
});

const loginSchema = z.object({
    country_code: z.string().min(1, 'Country code is required'),
    mobile: z.string().min(1, 'Mobile number is required')
});

const verifyOtpSchema = z.object({
    country_code: z.string().min(1, 'Country code is required'),
    mobile: z.string().min(1, 'Mobile number is required'),
    otp: z.string().min(1, 'OTP is required')
});

const forgotPasswordSchema = z.object({
    country_code: z.string().min(1, 'Country code is required'),
    mobile: z.string().min(1, 'Mobile number is required')
});

const resetPasswordSchema = z.object({
    country_code: z.string().min(1, 'Country code is required'),
    mobile: z.string().min(1, 'Mobile number is required'),
    otp: z.string().min(1, 'OTP is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters')
});

export const validateAuth = (type) => (req, res, next) => {
    try {
        let schema;
        switch (type) {
            case 'register':
                schema = registerSchema;
                break;
            case 'login':
                schema = loginSchema;
                break;
            case 'verify-otp':
                schema = verifyOtpSchema;
                break;
            case 'forgot-password':
                schema = forgotPasswordSchema;
                break;
            case 'reset-password':
                schema = resetPasswordSchema;
                break;
            default:
                throw new Error('Invalid validation type');
        }
        const validatedData = schema.parse(req.body);
        req.body = validatedData;
        next();
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.errors[0].message
        });
    }
};
