// helpers.js

// Simple logging function for debugging
const log = (message) => {
    console.log(`[LOG] - ${new Date().toISOString()} - ${message}`);
};

// Custom error handler for Sequelize errors
const sequelizeErrorHandler = (error) => {
    if (error.name === 'SequelizeValidationError') {
        return { message: 'Invalid data input.', status: 400 };
    } else if (error.name === 'SequelizeDatabaseError') {
        return { message: 'Database error occurred.', status: 500 };
    } else {
        return { message: error.message, status: 501 };
        // return { message: 'An unexpected error occurred.', status: 500 };
    }
}


// Function to format a date
const formatDate = (date, format = 'YYYY-MM-DD') => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(date).toLocaleDateString(undefined, options);
};

// Validation function to check if an email is valid
const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
};

// You can add more helper functions here as needed
module.exports = {
    log,
    formatDate,
    validateEmail,
    sequelizeErrorHandler,
};
