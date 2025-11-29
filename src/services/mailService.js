import nodemailer from "nodemailer";
import config from "../config/config.js";

const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: true,
    auth: {
        user: config.email.from,
        pass: config.email.password
    },
    tls: {
        rejectUnauthorized: false
    }
});


// const transporter = nodemailer.createTransport({
//     host: config.email.host, 
//     port: config.email.port,            
//     secure: config.email.secure,
//     auth: {
//         user: config.email.from, 
//         pass: config.email.password
//     }
// });
export const sendEmailOTP = async (to, otp) => {
    const mailOptions = {
        from: config.email.from,
        to,
        subject: "Delivery App - Password Reset OTP",
        html: `
        <div style="width:100%; background:#f5f5f5; padding:30px 0; font-family:Arial, sans-serif;">
            <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1);">

                <!-- HEADER -->
                <div style="background:#1a73e8; padding:20px 0; text-align:center;">
                    <h1 style="color:#ffffff; margin:0; font-size:24px; font-weight:600;">
                        Delivery Aap Ki
                    </h1>
                    <p style="color:#dce9ff; margin:5px 0 0; font-size:14px;">
                        Fast • Safe • Trusted
                    </p>
                </div>

                <!-- BODY -->
                <div style="padding:30px; text-align:center;">
                    <h2 style="color:#333; margin-top:0; font-size:22px;">
                        Password Reset Request
                    </h2>
                    <p style="color:#555; font-size:15px; line-height:22px; margin-bottom:25px;">
                        Your request to reset the password for your <b>Delivery Aap Ki</b> account has been received.  
                        Use the OTP below to verify your identity.
                    </p>

                    <!-- OTP BOX -->
                    <div style="
                        display:inline-block; 
                        background:#1a73e8; 
                        padding:15px 25px; 
                        border-radius:8px; 
                        color:#ffffff; 
                        font-size:32px; 
                        letter-spacing:5px; 
                        font-weight:bold;">
                        ${otp}
                    </div>

                    <p style="color:#777; margin-top:25px; font-size:14px;">
                        This OTP is valid for <b>10 minutes</b>.  
                        Do not share it with anyone for security reasons.
                    </p>
                </div>

                <!-- FOOTER -->
                <div style="background:#f0f0f0; padding:15px; text-align:center;">
                    <p style="color:#888; font-size:12px; margin:0;">
                        © ${new Date().getFullYear()} Delivery Aap Ki. All rights reserved.
                    </p>
                    <p style="color:#aaa; font-size:12px; margin:0; margin-top:4px;">
                        This is an automated message — please do not reply.
                    </p>
                </div>

            </div>
        </div>
        `
    };

    await transporter.sendMail(mailOptions);
};
