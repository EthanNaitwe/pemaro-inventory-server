const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Sale = sequelize.define('Sale', {
        customerName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        reference: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        payment: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        total: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
        },
        paid: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
        },
        due: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
        },
        biller: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        schema: 'inventory_schema',
        timestamps: true,
    });

    return Sale;
};
