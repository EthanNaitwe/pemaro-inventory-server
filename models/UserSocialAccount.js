const { DataTypes } = require('sequelize');
const User = require('./User');
const SocialMediaPlatform = require('./SocialMediaPlatform');
const { sequelize } = require('../config/db');

const UserSocialAccount = sequelize.define('UserSocialAccount', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    account_handle: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Ensures unique handles
    },
}, {});

// Relationships
User.belongsToMany(SocialMediaPlatform, { through: UserSocialAccount });
SocialMediaPlatform.belongsToMany(User, { through: UserSocialAccount });

UserSocialAccount.belongsTo(User);
UserSocialAccount.belongsTo(SocialMediaPlatform);
User.hasMany(UserSocialAccount);
SocialMediaPlatform.hasMany(UserSocialAccount);

module.exports = UserSocialAccount;
