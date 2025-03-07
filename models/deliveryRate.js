'use strict';
const { Model, UUIDV4 } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DeliveryRate extends Model {
    static associate(models) {

    //   DeliveryRate.belongsTo(models.Category, {
    //     foreignKey: 'categoryId',
    //     as: 'Category'
    //   });
    }
  }

  DeliveryRate.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    lga: {
      type: DataTypes.STRING,
      allowNull: false
    },
    deliveryCharge: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
   
  }, {
    sequelize,
    modelName: 'DeliveryRate',
  });

  return DeliveryRate;
};
