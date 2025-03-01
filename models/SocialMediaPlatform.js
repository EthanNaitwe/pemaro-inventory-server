const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SocialMediaPlatform = sequelize.define('SocialMediaPlatform', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    platform_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    platform_url: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
}, {});

module.exports = SocialMediaPlatform;
