const { Request, Response } = require("express");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require('bcrypt');
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const { uploadtocloudinary, uploadType } = require("../middleware/cloudinary");
const db = require("../models");
const { totalmem } = require("os");
const { Estimate, User, Product, Cart } = db;
const { Op } = require('sequelize');
const sendEstimate = require('../utils/sendEstimate.js')
const sequelize = db.sequelize;


// const create = async (req, res) => {
  
// 	try {
// 	  const { email, firstName, phone, estimationNotes, equipment, cost, totalWattage } = req.body;
  
	 
// 	  // Create a single purchase with all items
// 	  const estimate = await Estimate.create({
// 		id: uuidv4(),
// 		email,
//         firstName,
//         phone,
//         estimationNotes,
// 		equipment,
// 		cost,
// 		totalWattage
//       });



// 	  // Send email confirmation
// 	  await sendEstimate(
// 		"henry.eyo2@gmail.com",
// 		email,
// 		"Estimated Bill",
// 		"Estimated Bill"
// 		//fname,
// 		//`Order ID: ${estimate.id}`,
// 		// Estimate.items.reduce((sum, item) => sum + item.quantity, 0),
	
// 	  );
  
// 	  return res.status(200).json({
// 		estimate,
// 		msg: "Successfully created Estimate, check your email to see your receipt"
// 	  });
// 	} catch (error) {

// 	  console.error("Estimate creation error:", error);
// 	  return res.status(500).json({
// 		msg: "Failed to create Estimate",
// 		error: error.message
// 	  });
// 	}
//   };

const create = async (req, res) => {
	try {
	  const { email, firstName, phone, estimationNotes, equipment, cost, totalWattage } = req.body;
  
	  // Create the estimate
	  const estimate = await Estimate.create({
		id: uuidv4(),
		email,
		firstName,
		phone,
		estimationNotes,
		equipment,
		cost,
		totalWattage
	  });
  
	  // Parse equipment if it's a string
	  const equipmentList = typeof equipment === 'string' ? JSON.parse(equipment) : equipment;
  
	  // Generate the current date
	  const currentDate = new Date().toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	  });
  
	  // Create HTML email content
	  const emailHTML = `<!DOCTYPE html>
  <html>
  <head>
	  <title>Solar Equipment Estimation Receipt</title>
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
	  <div style="max-width: 800px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
		  <!-- Header -->
		  <div style="text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px;">
			  <h1 style="color: #2c3e50; margin: 0; font-size: 24px;">Solar Equipment Estimation</h1>
			  <p style="color: #7f8c8d; margin: 10px 0;">Reference: ${estimate.id}</p>
			  <p style="color: #7f8c8d; margin: 5px 0;">Date: ${currentDate}</p>
		  </div>
  
		  <!-- Customer Information -->
		  <div style="margin-bottom: 30px;">
			  <h2 style="color: #2c3e50; font-size: 18px;">Customer Details</h2>
			  <table style="width: 100%; border-collapse: collapse;">
				  <tr>
					  <td style="padding: 8px 0; color: #7f8c8d;">Name:</td>
					  <td style="padding: 8px 0;">${firstName}</td>
				  </tr>
				  <tr>
					  <td style="padding: 8px 0; color: #7f8c8d;">Email:</td>
					  <td style="padding: 8px 0;">${email}</td>
				  </tr>
				  <tr>
					  <td style="padding: 8px 0; color: #7f8c8d;">Phone:</td>
					  <td style="padding: 8px 0;">${phone}</td>
				  </tr>
			  </table>
		  </div>
  
		  <!-- Device List -->
		  <div style="margin-bottom: 30px;">
			  <h2 style="color: #2c3e50; font-size: 18px;">Selected Devices</h2>
			  <table style="width: 100%; border-collapse: collapse;">
				  <thead>
					  <tr style="background-color: #f8f9fa;">
						  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #eee;">Device</th>
						  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #eee;">Quantity</th>
						  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #eee;">Wattage</th>
						  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #eee;">Total Wattage</th>
					  </tr>
				  </thead>
				  <tbody>
					  ${equipmentList.map(item => `
						  <tr>
							  <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
							  <td style="padding: 12px; text-align: center; border-bottom: 1px solid #eee;">${item.quantity}</td>
							  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">${item.watt}W</td>
							  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #eee;">${item.watt * item.quantity}W</td>
						  </tr>
					  `).join('')}
				  </tbody>
				  <tfoot>
					  <tr style="background-color: #f8f9fa;">
						  <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold;">Total Power Requirement:</td>
						  <td style="padding: 12px; text-align: right; font-weight: bold;">${totalWattage}W</td>
					  </tr>
				  </tfoot>
			  </table>
		  </div>
  
		  <!-- Total Cost -->
		  <div style="margin-bottom: 30px;">
			  <h2 style="color: #2c3e50; font-size: 18px;">Estimated Cost</h2>
			  <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; text-align: right;">
				  <span style="font-size: 18px; font-weight: bold;">Total Estimated Cost: ₦${parseFloat(cost).toLocaleString()}</span>
			  </div>
		  </div>
  
		  <!-- Notes -->
		  ${estimationNotes ? `
		  <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
			  <h2 style="color: #2c3e50; font-size: 18px; margin-top: 0;">Estimation Notes</h2>
			  <p style="color: #7f8c8d; margin: 10px 0;">${estimationNotes}</p>
		  </div>
		  ` : ''}
  
		  <!-- Footer -->
		  <div style="margin-top: 30px; text-align: center; color: #7f8c8d; font-size: 14px;">
			  <p style="margin: 5px 0;">Thank you for choosing our solar solutions</p>
			  <p style="margin: 5px 0;">Contact us: support@solarcompany.com | +234 000 000 0000</p>
		  </div>
	  </div>
  </body>
  </html>`;
  
	  // Send email confirmation
	  await sendEstimate(
		"henry.eyo2@gmail.com",
		email,
		"Your Solar Equipment Estimation",
		"Your solar equipment estimation is attached below.",
		emailHTML
	  );
  
	  return res.status(200).json({
		estimate,
		msg: "Successfully created Estimate, check your email to see your receipt"
	  });
	} catch (error) {
	  console.error("Estimate creation error:", error);
	  return res.status(500).json({
		msg: "Failed to create Estimate",
		error: error.message
	  });
	}
  };

	const readall = async (req, res) => {
		try {
			const limit = req.query.limit || 10;
			const offset = req.query.offset;

			const records = await Estimate.findAll({
				// include:[{model:Payment, as: 'Payment'},{model:User, as: 'User'}]
			});
			return res.json(records);
		} catch (e) {
			return res.json({ msg: "fail to read", status: 500, route: "/read" });
		}
	}

	const readId = async (req, res) => {
		try {
			const { id } = req.params;
			const record = await Estimate.findOne({ where: { id } });
			return res.json(record);
		} catch (e) {
			return res.json({ msg: "fail to read", status: 500, route: "/read/:id" });
		}
	}

	const readByUserId = async (req, res) => {
		try {
			const { userId } = req.params;
			const communities = await Estimate.findAll({ where: { user: userId } });
			return res.json(communities);
		} catch (e) {
			return res.json({ msg: "fail to read", status: 500, route: "/read/user/:userId" });
		}
	}

	const update = async (req, res) => {
		try {
			// const { title, content } = req.body;
			const updated = await Estimate.update({ ...req.body }, { where: { id: req.params.id } });
			if (updated) {
				const updatedEstimate = await Estimate.findByPk(req.params.id);
				res.status(200).json(updatedEstimate);
			} else {
				res.status(404).json({ message: 'Estimate not found' });
			}
		} catch (error) {
			res.status(500).json({ message: 'Error updating the Estimate', error });
		}
	}

	const deleteId = async (req, res) => {
		try {
			const { id } = req.params;
			const record = await Estimate.findOne({ where: { id } });

			if (!record) {
				return res.json({ msg: "Can not find existing record" });
			}

			const deletedRecord = await record.destroy();
			return res.json({ record: deletedRecord });
		} catch (e) {
			return res.json({
				msg: "fail to read",
				status: 500,
				route: "/delete/:id",
			});
		}
	}


module.exports = {create, readall, readId, update, deleteId, readByUserId};