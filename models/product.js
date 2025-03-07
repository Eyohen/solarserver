'use strict';
const { Model, UUIDV4 } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {

      Product.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'Category'
      });
      Product.belongsTo(models.Brand, {foreignKey:'brandId', as:'Brand'})
    }
  }

  Product.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    discount: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    size: {
      type: DataTypes.STRING,
      allowNull: true
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    brandId: {
      type: DataTypes.UUID,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Product',
  });

  return Product;
};
