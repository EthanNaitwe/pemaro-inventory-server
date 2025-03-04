const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Product = sequelize.define('Product', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        size: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        artNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        // price: {
        //     type: DataTypes.DECIMAL(10, 2),
        //     allowNull: true,
        // },
        color: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        tax: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
        },
        discount: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        timestamps: true,
    });

    return Product;
};
