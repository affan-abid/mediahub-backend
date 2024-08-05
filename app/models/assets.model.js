const mongoose = require('mongoose');
const constants = require('../common/constants');

const Asset = mongoose.model(
    "Asset",
    new mongoose.Schema({
        title: {
          type: String,
          required: true,
          trim: true
        },
        price: {
          type: Number,
          required: true
        },
        keywords: {
          type: [String], // Array of keywords
          required: true,
          default: []
        },
        collection_name: { // collection is a reserved keyword in mongo so use collection_name
          type: String,
          trim: true
        },
        upload_file_size: {
          type: Number,
        },
        software: {
          type: String,
        },
        format: {
          type: String,
        },
        type: {
          type: String,
        },
        description: {
          type: String,
          trim: true
        },
        status: { type: String, enum: [constants.STATUS.Active, constants.STATUS.Inactive], default: constants.STATUS.Active },
        media: [{
          url: {
            type: String, // URL or path to the media file
            required: true
          }
        }],
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // Reference to the User model
          required: true
        }
      }, {
        timestamps: true // Automatically add createdAt and updatedAt fields
      })
);

module.exports = Asset;
