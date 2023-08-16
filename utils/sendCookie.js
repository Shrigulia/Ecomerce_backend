import jwt from 'jsonwebtoken';

const sendCookie = async (user, res, message, statusCode = 200) => {

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    // loging in
    res.status(statusCode).cookie("token", token, {
        httpOnly: true,
        secure: process.env.MODE === "Development" ? false : true,
        sameSite: process.env.MODE === "Development" ? "lax" : "none ",
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        )
    }).json({
        success: true,
        message,
        token,
        user: {
            name: user.name,
            email: user.email,
            avatar: user.avatar,
        },

    });
};

export default sendCookie;