export const catchError = async (res, status, success, message) => {
    return res.status(status).json({
        success: success,
        message: message
    })
}