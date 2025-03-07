const { Request, Response } = require("express");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require('bcrypt');
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const { uploadtocloudinary, uploadType } = require("../middleware/cloudinary");
const db = require("../models");
const { totalmem } = require("os");
const { Cart, User, Product } = db;
const { Op } = require('sequelize');



cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

	const create = async (req, res) => {

		try {
			const {email, fname, title, price, discount, description, weight, size, imageUrl, quantity, totalPrice, productId } = req.body;

			// fetch the product from the database
			const product = await Product.findByPk(productId);
			if(!product){
				return res.status(404).json({msg:"Product not found"});
			}

			// Calculate the final price considering the discount
			let finalPrice = product.price;
			if(product.discount && product.discount > 0 && product.discount < product.price){
				finalPrice = product.discount;
			}
		
			// Check if image was uploaded
			let imageurl = '';
			if (req.file) {
				console.log(req.file);
				// Upload image to Cloudinary
				const uploadresult = await uploadtocloudinary(req.file.buffer);
				if (uploadresult.message === "error") {
					throw new Error(uploadresult.error.message);
				}
				imageurl = uploadresult.url;
			}

			// create Cart record in the database
		const record = await Cart.create({email:req.body.email, imageUrl: imageurl, fname, title, price:finalPrice, quantity, totalPrice:finalPrice * quantity, ...req.body });

			return res.status(200).json({ record, msg: "Successfully created Cart, check your email to see your receipt" });

		} catch (error) {
			console.log("henry", error);
			return res.status(500).json({ msg: "fail to create", error });
		}
	}

	const readall = async (req, res) => {
		try {
			const limit = req.query.limit || 10;
			const offset = req.query.offset;

			const records = await Cart.findAll({
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
			const record = await Cart.findOne({ where: { id } });
			return res.json(record);
		} catch (e) {
			return res.json({ msg: "fail to read", status: 500, route: "/read/:id" });
		}
	}


	const readByUserId = async (req, res) => {
		try {
			const { userId } = req.params;
			const communities = await Cart.findAll({ where: { user: userId } });
			return res.json(communities);
		} catch (e) {
			return res.json({ msg: "fail to read", status: 500, route: "/read/user/:userId" });
		}
	}

	const update = async (req, res) => {
		try {
			// const { title, content } = req.body;
			const updated = await Cart.update({ ...req.body }, { where: { id: req.params.id } });
			if (updated) {
				const updatedCart = await Cart.findByPk(req.params.id);
				res.status(200).json(updatedCart);
			} else {
				res.status(404).json({ message: 'Cart not found' });
			}
		} catch (error) {
			res.status(500).json({ message: 'Error updating the Cart', error });
		}
	}

	const deleteId = async (req, res) => {
		try {
			const { id } = req.params;
			const record = await Cart.findOne({ where: { id } });

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

    const getUserCart = async (req, res) => {
        try {
            const { userId } = req.params;
    
            // Validate userId
            if (!userId || userId === 'undefined') {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID provided"
                });
            }
    
            // Validate if userId is a valid UUID
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(userId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid UUID format"
                });
            }
    
            // Verify if user exists
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }
    
            // Get all cart items for the user
            const cartItems = await Cart.findAll({
                where: { userId: userId },
                include: [{
                    model: Product,
                    attributes: ['id', 'title', 'imageUrl', 'price', 'discount']
                }],
                order: [['createdAt', 'DESC']]
            });
    
            // Calculate cart summary
            const cartSummary = cartItems.reduce((summary, item) => {
                summary.totalItems += item.quantity || 0;
                summary.subtotal += item.totalPrice || 0;
                summary.totalDeliveryCharge += item.deliveryCharge || 0;
                summary.totalVat += item.vat || 0;
                return summary;
            }, {
                totalItems: 0,
                subtotal: 0,
                totalDeliveryCharge: 0,
                totalVat: 0
            });
    
            return res.status(200).json({
                success: true,
                cartItems,
                cartSummary,
                message: "Cart items retrieved successfully"
            });
    
        } catch (error) {
            console.error("Error fetching user cart:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch cart items",
                error: error.message
            });
        }
    };
    

    const deleteUserCart = async (req, res) => {
        try {
            const { userId } = req.params;
    
            // Validate userId
            if (!userId || userId === 'undefined') {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID provided"
                });
            }
    
            // Validate if userId is a valid UUID
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(userId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid UUID format"
                });
            }
    
            // Verify if user exists
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }
    
            // Delete all cart items for the user
            const deletedCount = await Cart.destroy({
                where: { userId: userId }
            });
    
            return res.status(200).json({
                success: true,
                message: "Cart cleared successfully",
                deletedItems: deletedCount
            });
    
        } catch (error) {
            console.error("Error deleting user cart:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to clear cart",
                error: error.message
            });
        }
    };

    const getCartCount = async (req, res) => {
        try {
            const { userId } = req.params;
            const { countType = 'total' } = req.query; // 'total' or 'unique'
    
            // Validate userId
            if (!userId || userId === 'undefined') {
                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID provided"
                });
            }
    
            // Validate if userId is a valid UUID
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(userId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid UUID format"
                });
            }
    
            // Verify if user exists
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }
    
            let count;
    
            if (countType === 'unique') {
                // Count unique items (regardless of quantity)
                count = await Cart.count({
                    where: { userId }
                });
            } else {
                // Count total items (including quantities)
                const cartItems = await Cart.findAll({
                    where: { userId },
                    attributes: ['quantity']
                });
    
                count = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
            }
    
            return res.status(200).json({
                success: true,
                count,
                countType,
                message: "Cart count retrieved successfully"
            });
    
        } catch (error) {
            console.error("Error getting cart count:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to get cart count",
                error: error.message
            });
        }
    };

module.exports = {create, readall, readId, update, deleteId, readByUserId, getUserCart, deleteUserCart, getCartCount};