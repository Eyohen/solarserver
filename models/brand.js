'use strict';
const { Model, UUIDV4 } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Brand extends Model {
    static associate(models) {
      // define the assiociation here

      Brand.hasMany(models.Product, {
        foreignKey: 'brandId',
        as: 'Product' // updated alias
      });
    }
  }
  
  Brand.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
      allowNull: false,
      
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },

  }, {
    sequelize,
    modelName: 'Brand',
  });
  
  return Brand;
};
