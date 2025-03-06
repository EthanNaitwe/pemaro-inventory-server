// models/user.js

const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        surname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        other_names: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        avatar: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        gender: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        birth_date: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            }
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        // schema: 'inventory_schema',
        hooks: {
            beforeCreate: async (user) => {
                const hashedPassword = await bcrypt.hash(user.password, 10);
                user.password = hashedPassword;
            }
        }
    });

    User.prototype.validatePassword = async function (password) {
        return bcrypt.compare(password, this.password);
    };

    return User;
};
