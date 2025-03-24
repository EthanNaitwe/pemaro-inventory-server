// index.js
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const winston = require('winston');

const userRoutes = require('./routes/user.g.routes');
const productRoutes = require('./routes/product.g.routes');
const saleRoutes = require('./routes/sale.g.routes');
const expenseRoutes = require("./routes/expense.g.routes");

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

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello from Vercel Express!' });
});

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/sales', saleRoutes);
app.use("/api/v1/expenses", expenseRoutes);


// // Sync Sequelize models and start the server
// db.sequelize.sync({ alter: true })
//     .then(() => {
//         app.listen(PORT, () => {
//             console.log(`Server running on port ${PORT}`);
//         });
//         // app(req, res);  // This allows Express to handle the request
//     })
//     .catch(err => console.error('Error syncing database:', err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
