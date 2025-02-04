const errorHandler = (err, req, res, next) => {
    // ReferenceError (undefined variables or similar issues)
    if (err instanceof ReferenceError) {
        return res.status(500).json({
            success: false,
            message: `System Error: ${err.message}. Please contact support or try again later.`
        });
    }

    // Check for missing or invalid fields in a request
    if (err.message && err.message.includes("not defined")) {
        return res.status(400).json({
            success: false,
            message: `Bad Request: ${err.message} is required or invalid.`
        });
    }

    // If the error message contains specific details, return it
    if (err.message) {
        return res.status(400).json({
            success: false,
            message: `Error: ${err.message}`
        });
    }

    // Catch-all for any other errors
    res.status(err.statusCode || 500).json({
        success: false,
        message: "An unexpected error occurred. Please try again later."
    });
};


export {
    errorHandler
}