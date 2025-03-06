// config/database.js

const { Sequelize } = require('sequelize');
const path = require('path');

const DB_DIALECT = process.env.DB_DIALECT || 'sqlite';
let sequelize;

if (DB_DIALECT === 'postgres') {
    // PostgreSQL DB
    sequelize = new Sequelize('postgres://postgres:password@localhost:5432/pemaro', {
        dialect: 'postgres',
        logging: false,
        // define: {
        //     schema: 'inventory_schema'
        // }
    });
    console.log('🔗 Connected to PostgreSQL Database');
} else {
    // SQLite DB
    sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../../database.sqlite'), // Path to SQLite file
        logging: false, // Disable logging
    });
    console.log('🔗 Connected to SQLite Database');
}

const User = require('../../models/User')(sequelize)
const Product = require('../../models/Product')(sequelize)
const ProductVariant = require('../../models/ProductVariant')(sequelize, Product)

const db = {
    sequelize,
    Sequelize,
    User,
    Product,
    ProductVariant,
};

module.exports = db;
