'use strict';


const {Model, UUIDV4} = require('sequelize');



module.exports = (sequelize, DataTypes) => {
  class Booking extends Model{
   
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

 
    static associate(models) {
      // define association here

//   Booking.hasOne(models.User, {
//     foreignKey: 'bookingId',
//     as: 'User'
//   }
// )
    }
  }
  Booking.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: UUIDV4,
      allowNull: false,
      primaryKey: true,
      // autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
      },
    time: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
      },
    // tea : {
    //   type: DataTypes.STRING,
    //   allowNull:true,
    // },
    tea : {
      type: DataTypes.ARRAY(DataTypes.STRING), // array of strings
      allowNull:true,
    },
    iceTea : {
      type: DataTypes.STRING,
      allowNull:true,
    },
    coffee : {
      type: DataTypes.STRING,
      allowNull:true,
    },
    menu: {
        type: DataTypes.STRING,
        allowNull: false
      },
    date: {
          type: DataTypes.STRING,
          allowNull: false
        },

  }, {
    sequelize,
    modelName: 'Booking',
  });
  return Booking;
};