import nodemailer from 'nodemailer';

const sendEmail = async (options) => {

    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        service: "gmail",
        auth: {
            user: process.env.MAIL,
            pass: process.env.MAIL_PASS
        },
    });

    const mailOptions = {
        from: process.env.MAIl,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(mailOptions);
};

export default sendEmail;