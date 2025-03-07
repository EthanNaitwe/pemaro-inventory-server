// config/database.js

const { Sequelize } = require('sequelize');
const path = require('path');

// PostgreSQL DB
const sequelize = new Sequelize('postgres://postgres:password@localhost:5432/pemaro', {
    dialect: 'postgres',
    logging: false,
    define: {
        schema: 'inventory_schema'
    }
});

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
