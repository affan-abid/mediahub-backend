const db = require("../models");
const User = db.user;
const Role = db.role;
const Asset = db.assets;
const Keyword = db.keywords;
const constants = require('../common/constants');
const fs = require('fs');
const path = require('path');

exports.getAllSellers = (req, res) => {

  const page = parseInt(req.body.pageNumber) || 1;
  const limit = parseInt(req.body.pageSize) || 10;
  const keyword = req.body.keyword || null;

  // Find the "seller" role by name
  Role.findOne({ name: constants.ROLES.SELLER }, (err, role) => {
    if (err) {
      return res.status(500).send({ message: err });
    }

    if (!role) {
      return res.status(400).send({ message: "Seller role not found." });
    }

    // Calculate skip and limit
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = { role: role._id };

    if (keyword) {
      searchQuery.$or = [
        { username: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { full_name: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Find users with the "seller" role, applying pagination
    User.find(searchQuery)
    .populate({
      path: "role",
      select: "name" // Only include the 'name' field from the Role model
    })
      .skip(skip)
      .limit(limit)
      .exec((err, users) => {
        if (err) {
          return res.status(500).send({ message: err });
        }

        // Count total users with the "seller" role for pagination metadata
        User.countDocuments({ role: role._id }, (err, total) => {
          if (err) {
            return res.status(500).send({ message: err });
          }

          // Send the paginated list of users with the "seller" role
          res.status(200).send({
            metadata: {
              "currentPage": page,
              "totalPages": Math.ceil(total / limit),
              "totalCount": total,
              "pageSize": limit,
            },
            data: users
          });
        });
      });
  });
};

exports.getAllBuyers = (req, res) => {

  const page = parseInt(req.body.pageNumber) || 1;
  const limit = parseInt(req.body.pageSize) || 10;
  const keyword = req.body.keyword || null;

  // Find the "seller" role by name
  Role.findOne({ name: constants.ROLES.BUYER }, (err, role) => {
    if (err) {
      return res.status(500).send({ message: err });
    }

    if (!role) {
      return res.status(400).send({ message: "Buyer role not found." });
    }

    // Calculate skip and limit
    const skip = (page - 1) * limit;

    // Build search query
    const searchQuery = { role: role._id };

    if (keyword) {
      searchQuery.$or = [
        { username: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { full_name: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Find users with the "seller" role, applying pagination
    User.find(searchQuery)
    .populate({
      path: "role",
      select: "name" // Only include the 'name' field from the Role model
    })
      .skip(skip)
      .limit(limit)
      .exec((err, users) => {
        if (err) {
          return res.status(500).send({ message: err });
        }

        // Count total users with the "seller" role for pagination metadata
        User.countDocuments({ role: role._id }, (err, total) => {
          if (err) {
            return res.status(500).send({ message: err });
          }

          // Send the paginated list of users with the "seller" role
          res.status(200).send({
            metadata: {
              "currentPage": page,
              "totalPages": Math.ceil(total / limit),
              "totalCount": total,
              "pageSize": limit,
            },
            data: users
          });
        });
      });
  });
};

exports.getUser = (req, res) => {
  // Get user ID from the URL parameter
  const userId = req.params.id;

  // Find the user by ID
  User.findById(userId).populate({
      path: "role",
      select: "name" // Only include the 'name' field from the Role model
    }).exec((err, user) => {
    if (err) {
      // Handle potential errors
      return res.status(500).send({ message: "Error retrieving user with ID " + userId });
    }

    if (!user) {
      // If no user is found, return a 404 status
      return res.status(404).send({ message: "User not found with ID " + userId });
    }

    // Send the user data if found
    res.status(200).send(user);
  });
};

exports.updateUser = (req, res) => {
  const userId = req.params.id;
  const updateData = req.body;

  // Validate the update data (you can customize this validation based on your requirements)
  if (!updateData) {
    return res.status(400).send({ message: "Update data is required." });
  }

  // Find the user by ID and update
  User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }, (err, user) => {
    if (err) {
      return res.status(500).send({ message: "Error updating user with ID " + userId });
    }

    if (!user) {
      return res.status(404).send({ message: "User not found with ID " + userId });
    }

    // Populate the roles field and return the updated user
    User.findById(userId)
      .populate('role') // Populate the roles field
      .exec((err, populatedUser) => {
        if (err) {
          return res.status(500).send({ message: "Error retrieving user with populated role." });
        }

        // Send the updated user data with populated roles
        res.status(200).send(populatedUser);
      });
  });
};

exports.updateUserStatus = (req, res) => {
  const userId = req.params.id;

  // Find the user by ID
  User.findById(userId, (err, user) => {
    if (err) {
      return res.status(500).send({ message: "Error retrieving user with ID " + userId });
    }

    if (!user) {
      return res.status(404).send({ message: "User not found with ID " + userId });
    }

    // Toggle the status
    user.status = user.status === 'Active' ? 'Pending' : 'Active';

    // Save the updated user status
    user.save((err, updatedUser) => {
      if (err) {
        return res.status(500).send({ message: "Error updating user status." });
      }

      // Populate the roles field and return the updated user
      User.findById(updatedUser._id)
        .populate('role')
        .exec((err, populatedUser) => {
          if (err) {
            return res.status(500).send({ message: "Error retrieving user with populated role." });
          }

          // Send the updated user data with populated roles
          res.status(200).send(populatedUser);
        });
    });
  });
};


exports.createAsset = async (req, res) => {
  try {
    let { title, price, keywords, new_keywords, collection_name, upload_file_size, software, format, type, description, user_id } = req.body;
    // Check if required fields are present
    if (!title || !price || !keywords || !collection_name || !user_id || !req.files) {
      return res.status(400).send({ message: 'Title, price, keywords, user ID, and media files are required.' });
    }

    // Validate user existence and role
    const user = await User.findById(user_id).populate('role');
    if (!user) {
      return res.status(404).send({ message: 'User not found.' });
    }

    if (user.role.name !== constants.ROLES.SELLER) {
      return res.status(403).send({ message: 'User does not have the required role.' });
    }

    if (new_keywords && new_keywords.length > 0) {
      if (!Array.isArray(new_keywords)) {
        new_keywords = [new_keywords];
      }
      let uniqueKeywords = [...new Set(new_keywords.map(keyword => keyword.trim()))];
      await Promise.all(
        uniqueKeywords.map(keyword => 
          Keyword.findOneAndUpdate(
            { name: keyword }, 
            { name: keyword }, 
            { upsert: true, new: true, setDefaultsOnInsert: true } // Upsert: create if not exists
          )
        )
      );
    }

    // Process files
    const media = req.files.map(file => ({
      url: file.path
    }));

    // Create new asset
    const newAsset = new Asset({
      title,
      price,
      keywords: keywords ? JSON.stringify(keywords) : [], // Assuming keywords come as a JSON string
      collection_name,
      upload_file_size,
      software,
      format,
      type,
      description,
      media,
      user_id,
      status: constants.STATUS.Active
    });

    // Save the asset
    const savedAsset = await newAsset.save();
    
    const populatedAsset = await Asset.findById(savedAsset._id)
    .populate({
      path: 'user_id',
      populate: {
        path: 'role',
        model: 'Role' // Ensure the Role model is referenced correctly
      }
    });

    res.status(201).send(populatedAsset);
  } catch (err) {
    console.error('Error uploading asset:', err);
    res.status(500).send({ message: 'Error uploading asset.' });
  }
};

exports.getAllAssets = async (req, res) => {
  try {
    // Extract pagination parameters from query, with default values
    const page = parseInt(req.body.pageNumber) || 1;
    const limit = parseInt(req.body.pageSize) || 10;
    const keyword = req.body.keyword || null;
    const skip = (page - 1) * limit;

    let filters = {
      status: constants.STATUS.Active
    };

    if (keyword) {
      filters.$or = [
        { title: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Find assets with status active, using pagination
    const assets = await Asset.find(filters)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'user_id',
        populate: {
          path: 'role',
          model: 'Role' // Ensure the Role model is referenced correctly
        }
      });

    // Count total number of assets with status active for pagination info
    const totalAssets = await Asset.countDocuments(filters);

    // Calculate total pages
    const totalPages = Math.ceil(totalAssets / limit);

    // Send the paginated assets and additional info
    res.status(200).send({
      data: assets,
      metadata: {
        "currentPage": page,
        "totalPages": totalPages,
        "totalCount": totalAssets,
        "pageSize": limit,
      },
    });
  } catch (err) {
    console.error('Error retrieving assets:', err);
    res.status(500).send({ message: 'Error retrieving assets.' });
  }
};

exports.getAsset = async (req, res) => {
  try {
    const { id } = req.params; // Extract asset ID from the request parameters

    // Find the asset by ID and populate user and role
    const asset = await Asset.findById(id)
      .populate({
        path: 'user_id',
        populate: {
          path: 'role',
          model: 'Role' // Ensure the Role model is referenced correctly
        }
      });

    // Check if asset was found
    if (!asset) {
      return res.status(404).send({ message: 'Asset not found.' });
    }

    // Send the asset details in the response
    res.status(200).send(asset);
  } catch (err) {
    console.error('Error retrieving asset:', err);
    res.status(500).send({ message: 'Error retrieving asset.' });
  }
};


exports.getAssetsByCreator = async (req, res) => {
  try {
    // Extract pagination parameters from query, with default values
    const { creator_id } = req.params; // Extract asset ID from the request parameters

    const page = parseInt(req.body.pageNumber) || 1;
    const limit = parseInt(req.body.pageSize) || 10;
    const keyword = req.body.keyword || null;
    const skip = (page - 1) * limit;

    let filters = {
      status: constants.STATUS.Active,
      user_id: creator_id
    };

    if (keyword) {
      filters.$or = [
        { title: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Find assets with status active, using pagination
    const assets = await Asset.find(filters)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'user_id',
        populate: {
          path: 'role',
          model: 'Role' // Ensure the Role model is referenced correctly
        }
      });

    // Count total number of assets with status active for pagination info
    const totalAssets = await Asset.countDocuments(filters);

    // Calculate total pages
    const totalPages = Math.ceil(totalAssets / limit);

    // Send the paginated assets and additional info
    res.status(200).send({
      data: assets,
      metadata: {
        "currentPage": page,
        "totalPages": totalPages,
        "totalCount": totalAssets,
        "pageSize": limit,
      },
    });
  } catch (err) {
    console.error('Error retrieving assets:', err);
    res.status(500).send({ message: 'Error retrieving assets.' });
  }
};

exports.deleteMediaAssets = async (req, res) => {
  try {
    const { asset_id, media_id } = req.params;

    // Find the asset by ID
    const asset = await Asset.findById(asset_id);
    if (!asset) {
      return res.status(404).send({ message: 'Asset not found.' });
    }

    // Find the media to be deleted
    const media = asset.media.id(media_id);
    if (!media) {
      return res.status(404).send({ message: 'Media not found.' });
    }

    // Remove media from the asset
    asset.media.id(media_id).remove();

    // Delete the file from the server
    const filePath = path.resolve(media.url);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        return res.status(500).send({ message: 'Error deleting media file.' });
      }
    });

    // Save the updated asset
    await asset.save();

    // Send success response
    res.status(200).send({ message: 'Media file deleted successfully.' });
  } catch (err) {
    console.error('Error deleting media from asset:', err);
    res.status(500).send({ message: 'Error deleting media from asset.' });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    let { title, price, keywords, new_keywords, collection_name, upload_file_size, software, format, type, description } = req.body;
    
    // Find the asset by ID
    const asset = await Asset.findById(id);
    if (!asset) {
      return res.status(404).send({ message: 'Asset not found.' });
    }

    if (new_keywords && new_keywords.length > 0) {
      if (!Array.isArray(new_keywords)) {
        new_keywords = [new_keywords];
      }
      const uniqueKeywords = [...new Set(new_keywords.map(keyword => keyword.trim()))];
      await Promise.all(
        uniqueKeywords.map(keyword => 
          Keyword.findOneAndUpdate(
            { name: keyword }, 
            { name: keyword }, 
            { upsert: true, new: true, setDefaultsOnInsert: true } // Upsert: create if not exists
          )
        )
      );
    }

    // Update asset details
    if (title) asset.title = title;
    if (price) asset.price = price;
    if (keywords) asset.keywords = JSON.parse(keywords); // Assuming keywords come as a JSON string
    if (collection_name) asset.collection_name = collection_name;
    if (upload_file_size) asset.upload_file_size = upload_file_size;
    if (software) asset.software = software;
    if (format) asset.format = format;
    if (type) asset.type = type;
    if (description) asset.description = description;

    // Handle media files
    if (req.files) {
      // Add new media files
      const newMedia = req.files.map(file => ({
        url: file.path,
      }));

      // Update media array with new files
      asset.media = newMedia;
    }

    // Save the updated asset
    const updatedAsset = await asset.save();

    const populatedAsset = await Asset.findById(updatedAsset._id)
    .populate({
      path: 'user_id',
      populate: {
        path: 'role',
        model: 'Role' // Ensure the Role model is referenced correctly
      }
    });

    // Send the updated asset as response
    res.status(200).send(populatedAsset);
  } catch (err) {
    console.error('Error updating asset:', err);
    res.status(500).send({ message: 'Error updating asset.' });
  }
};

exports.updateAssetStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the asset by ID
    const asset = await Asset.findById(id)
      .populate({
        path: 'user_id',
        populate: {
          path: 'role',
          model: 'Role' // Ensure the Role model is referenced correctly
        }
      });

    if (!asset) {
      return res.status(404).send({ message: 'Asset not found.' });
    }

    // Toggle asset status
    asset.status = asset.status === constants.STATUS.Active ? constants.STATUS.Inactive : constants.STATUS.Active;

    // Save the updated asset
    const updatedAsset = await asset.save();

    // Return the updated asset with populated fields
    res.status(200).send(updatedAsset);
  } catch (err) {
    console.error('Error updating asset status:', err);
    res.status(500).send({ message: 'Error updating asset status.' });
  }
};


exports.getSellersWithAssetCount = async (req, res) => {
  try {

    const page = parseInt(req.body.pageNumber) || 1;
    const limit = parseInt(req.body.pageSize) || 10;
    const keyword = req.body.keyword || null;
    const skip = (page - 1) * limit;

    // Find the role ID for "seller"
    const role = await Role.findOne({ name: constants.ROLES.SELLER }).select('_id');
    if (!role) {
      return res.status(404).send({ message: 'Role "seller" not found.' });
    }

    const roleId = role._id;

    // Construct filters
    let filters = { role: roleId, status: constants.STATUS.Active, };

    if (keyword) {
      filters.$or = [
        { username: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { full_name: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Find all users with the role "seller"
    const sellers = await User.find(filters)
      .skip(skip)
      .limit(limit)
      .select('_id full_name username');

    if (!sellers.length) {
      return res.status(404).send({ message: 'No sellers found.' });
    }

    // Create an array to hold sellers with their asset counts
    const sellersWithAssetCount = await Promise.all(
      sellers.map(async (seller) => {
        const assetCount = await Asset.countDocuments({ user_id: seller._id });
        return {
          user: seller,
          assetCount
        };
      })
    );

    // Count total number of sellers for pagination info
    const totalSellers = await User.countDocuments(filters);

    // Calculate total pages
    const totalPages = Math.ceil(totalSellers / limit);

    // Send the paginated sellers with their asset counts and additional info
    res.status(200).send({
      data: sellersWithAssetCount,
      metadata: {
        currentPage: page,
        totalPages: totalPages,
        totalCount: totalSellers,
        pageSize: limit,
      },
    });
  } catch (err) {
    console.error('Error retrieving sellers with asset counts:', err);
    res.status(500).send({ message: 'Error retrieving sellers with asset counts.' });
  }
};

exports.getAllKeywords = async (req, res) => {
  try {
    // Fetch all keywords from the database
    const keywords = await Keyword.find().exec();

    // Send the response with all keywords
    res.status(200).send({ data: keywords });
  } catch (err) {
    console.error('Error retrieving keywords:', err);
    res.status(500).send({ message: 'Error retrieving keywords.' });
  }
};