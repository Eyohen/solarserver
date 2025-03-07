const { Request, Response } = require("express");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require('bcrypt');
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const { uploadtocloudinary, uploadType } = require("../middleware/cloudinary");
const db = require("../models");
const { totalmem } = require("os");
const { Product, User, Purchase,Review } = db;
const { Op, where } = require('sequelize');

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});


	const create = async (req, res) => {
		try {


            const {productId} = req.params;
			const {userId, rating, comment } = req.body;

            // check if the product exists
            const product = await Product.findByPk(productId);
            if(!product) {
                return res.status(404).json({message:'Product not found'});
            }
			
            //check if the user has purchased the product
            const purchase = await Purchase.findOne({
                where:{userId, productId}
            });
            if(!purchase){
                return res.status(403).json({message:'Sorry you have to purchase this product to review'});
            }

            // check if the user has already reviewed this product
            const existingReview = await Review.findOne({
                where:{userId, productId}
            });
            if(existingReview){
                return res.status(403).json({message:'You have already reviewed this product'})
            }


			// create Product record in the database
			const review = await Review.create({ userId, productId, rating, comment });
			return res.status(200).json({ review, message: "Successfully created review!" });
		} catch (error) {
			console.log("henry", error);
			return res.status(500).json({ message: "Internal server error", error });
		}
	}

	const readall = async (req, res) => {
		try {
			const limit = req.query.limit || 10;
			const offset = req.query.offset;

			const records = await Review.findAll({
				// include:[{model:Payment, as: 'Payment'},{model:User, as: 'User'}]
			});
			return res.json(records);
		} catch (e) {
			return res.json({ message: "fail to read", status: 500, });
		}
	}

	const readId = async (req, res) => {
		try {
			const { id } = req.params;
			const record = await Review.findOne({ where: { id } });
			return res.json(record);
		} catch (e) {
			return res.json({ msg: "fail to read", status: 500, });
		}
	}

	const readByUserId = async (req, res) => {
		try {
			const { userId } = req.params;
			const communities = await Review.findAll({ where: { user: userId } });
			return res.json(communities);
		} catch (e) {
			return res.json({ msg: "fail to read", status: 500, route: "/read/user/:userId" });
		}
	}

	const update = async (req, res) => {
		try {
			// const { title, content } = req.body;
			const updated = await Review.update({ ...req.body }, { where: { id: req.params.id } });
			if (updated) {
				const updatedReview = await Review.findByPk(req.params.id);
				res.status(200).json(updatedReview);
			} else {
				res.status(404).json({ message: 'Product not found' });
			}
		} catch (error) {
			res.status(500).json({ message: 'Error updating the Product', error });
		}
	}

	const deleteId = async (req, res) => {
		try {
			const { id } = req.params;
			const record = await Review.findOne({ where: { id } });

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