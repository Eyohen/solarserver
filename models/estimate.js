'use strict';
const { Model, UUIDV4 } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Estimate extends Model {
    static associate(models) {
      // Add associations if needed
    }
  }

  Estimate.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
  
    estimationNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    equipment: {
      type: DataTypes.JSONB,  // Changed to JSONB to properly store array/object data
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('equipment');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('equipment', JSON.stringify(value));
      }
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),  // Changed to DECIMAL for currency
      allowNull: true
    },
    totalWattage: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
  }, {
    sequelize,
    modelName: 'Estimate',
  });

  return Estimate;
};