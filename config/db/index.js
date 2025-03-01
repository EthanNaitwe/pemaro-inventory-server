// config/database.js

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('postgres://postgres:password@localhost:5432/pemaro', {
    dialect: 'postgres',
    logging: false,
    define: {
        schema: 'inventory_schema'
    }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require('../../models/User')(sequelize);
db.Product = require('../../models/Product')(sequelize);

module.exports = db;
