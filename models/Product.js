const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Product = sequelize.define('Product', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        artNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
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
        // schema: 'inventory_schema',
        timestamps: true,
    });

    return Product;
};
