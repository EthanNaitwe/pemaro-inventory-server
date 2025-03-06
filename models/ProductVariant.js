const { DataTypes } = require('sequelize');

module.exports = (sequelize, Product) => {
    const ProductVariant = sequelize.define('ProductVariant', {
        productId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Products', // Use table name as a string instead of model reference
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        size: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        color: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        // schema: 'inventory_schema',
        timestamps: true,
    });

    Product.hasMany(ProductVariant, { foreignKey: 'productId', as: 'variants' });
    ProductVariant.belongsTo(Product, { foreignKey: 'productId' });

    return ProductVariant;
};
