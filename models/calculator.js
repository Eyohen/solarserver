'use strict';
const { Model, UUIDV4 } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Calculator extends Model {
    static associate(models) {
      // Add associations if needed
    }
  }

  Calculator.init({
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
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    appliances: {
      type: DataTypes.JSONB, // Store appliance selections as JSON
      allowNull: false,
      defaultValue: []
    },
    totalWattage: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    totalAppliances: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed'),
      defaultValue: 'pending'
    },
    estimationNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Calculator',
  });

  return Calculator;
};