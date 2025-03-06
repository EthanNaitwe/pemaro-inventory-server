// index.js

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const winston = require('winston');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./config/db');
const { sequelizeErrorHandler } = require('./config/helpers');
const { validate, registerSchema, loginSchema } = require('./middlewares/validate');
const { Sequelize } = require('sequelize');
const { User } = db;

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/product.routes');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Setting up Winston logger for activity logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        }),
        new winston.transports.File({ filename: 'activity.log' })
    ]
});

app.use(cors());

// Morgan middleware for logging HTTP requests
app.use(morgan('combined'));

// Custom middleware to log activity in the app
app.use((req, res, next) => {
    logger.info(`Request to ${req.method} ${req.originalUrl}`);
    next();
});

app.use(express.json());


app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);


// Sync Sequelize models and start the server
db.sequelize.sync({ alter: true })
    .then(() => {
        console.log(`✅ Database synced at: ${db.sequelize.options.storage}`)
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => console.error('Error syncing database:', err));
