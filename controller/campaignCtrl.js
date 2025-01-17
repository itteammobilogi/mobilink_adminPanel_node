import mongoose from "mongoose";
import Campaign from "../models/campaignModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// export const createCampaign = async (req, res) => {
//   try {
//     console.log("File:", req.file);
//     console.log("Body:", req.body);
//     const {
//       campaignName,
//       campaignPayout,
//       campaignCategory,
//       campaignType,
//       geo,
//       featured,
//       preferred,
//       previewLink,
//       device,
//       allowedMedia,
//       disallowedMedia,
//       description,
//     } = req.body;

//     // Ensure a file was uploaded
//     if (!req.file) {
//       return res.status(400).json({ message: "Image file is required." });
//     }

//     // Get the file path
//     const image = req.file.filename;

//     // Validate required fields
//     if (
//       !campaignName ||
//       !featured ||
//       !campaignCategory ||
//       !campaignType ||
//       !geo ||
//       !campaignPayout ||
//       !previewLink ||
//       !device ||
//       !allowedMedia ||
//       !description ||
//       !preferred
//     ) {
//       return res.status(400).json({
//         message: "All required fields must be provided.",
//       });
//     }

//     // Create new campaign
//     const newCampaign = new Campaign({
//       campaignName,
//       campaignPayout,
//       campaignCategory,
//       campaignType,
//       geo,
//       featured,
//       preferred,
//       image,
//       previewLink,
//       device,
//       allowedMedia,
//       disallowedMedia,
//       description,
//     });

//     const savedCampaign = await newCampaign.save();

//     console.log(savedCampaign);

//     res.status(200).json({
//       message: "Campaign created successfully",
//       data: savedCampaign,
//     });
//   } catch (error) {
//     console.error("Error creating campaign:", error);
//     res
//       .status(500)
//       .json({ message: "Internal Server Error", error: error.message });
//   }
// };

export const createCampaign = async (req, res) => {
  try {
    const { body, file } = req;

    console.log("Received body:", body);
    console.log("Received file:", file);

    // Parse the geo field
    let geoArray = [];
    if (body.geo) {
      if (Array.isArray(body.geo)) {
        geoArray = body.geo;
      } else if (typeof body.geo === "string") {
        try {
          geoArray = JSON.parse(body.geo);
          if (!Array.isArray(geoArray)) {
            geoArray = [geoArray];
          }
        } catch (error) {
          console.error("Error parsing geo:", error);
          return res.status(400).json({ error: "Invalid geo format" });
        }
      }
    }

    // Parse allowedMedia and disallowedMedia
    let allowedMedia = [];
    if (body.allowedMedia) {
      try {
        allowedMedia = JSON.parse(body.allowedMedia);
        if (!Array.isArray(allowedMedia)) {
          allowedMedia = [];
        }
      } catch (error) {
        console.error("Error parsing allowedMedia:", error);
        allowedMedia = [];
      }
    }

    let disallowedMedia = [];
    if (body.disallowedMedia) {
      try {
        disallowedMedia = JSON.parse(body.disallowedMedia);
        if (!Array.isArray(disallowedMedia)) {
          disallowedMedia = [];
        }
      } catch (error) {
        console.error("Error parsing disallowedMedia:", error);
        disallowedMedia = [];
      }
    }

    // Construct campaign data
    const campaignData = {
      campaignName: body.campaignName,
      campaignPayout: body.campaignPayout,
      campaignCategory: body.campaignCategory,
      campaignType: body.campaignType,
      geo: geoArray,
      featured: body.featured,
      preferred: body.preferred,
      image: file ? `/uploads/${file.filename}` : null,
      previewLink: body.previewLink,
      device: body.device,
      allowedMedia,
      disallowedMedia,
      description: body.description,
    };

    const newCampaign = new Campaign(campaignData);
    await newCampaign.save();

    res.status(201).json({
      message: "Campaign created successfully",
      campaign: newCampaign,
    });
  } catch (error) {
    console.error("Error creating campaign:", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getAllCampaign = async (req, res) => {
  try {
    const { search, campaignType, geoCountry, page, limit } = req.query;

    const query = {};

    // Filter by search keyword
    if (search) {
      query.campaignName = { $regex: search, $options: "i" };
    }

    // Filter by campaign type
    if (
      campaignType &&
      campaignType !== "All Categories" &&
      campaignType !== "All Objectives"
    ) {
      query.campaignType = campaignType;
    }
    if (geoCountry && geoCountry !== "All Countries") {
      query.geo = geoCountry;
    }

    // console.log("Query Object:", query);

    // Pagination logic
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    // const pageNumber = parseInt(req.query.page) || 1;
    // const pageSize = parseInt(req.query.limit) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // Fetch campaigns with pagination
    const campaigns = await Campaign.find(query).skip(skip).limit(pageSize);

    // Fetch total count for pagination
    const totalCampaigns = await Campaign.countDocuments(query);

    // Fetch distinct campaign types
    const campaignTypes = await Campaign.distinct("campaignType");

    // Calculate total pages
    const totalPages = Math.ceil(totalCampaigns / pageSize);

    res.status(200).json({
      message: "Campaigns fetched successfully",
      data: campaigns,
      campaignTypes,
      totalPages,
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getSingleCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    // Log the received ID
    console.log("Fetching campaign with ID:", id);

    // Validate the ID format (if using MongoDB)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid campaign ID." });
    }

    // Fetch the campaign from the database
    const campaign = await Campaign.findById(id);

    // If no campaign is found
    if (!campaign) {
      console.error("Campaign not found for ID:", id);
      return res.status(404).json({ message: "Campaign not found." });
    }

    // Return the campaign data
    res
      .status(200)
      .json({ message: "Campaign fetched successfully", data: campaign });
  } catch (error) {
    console.error("Error in getSingleCampaign:", error.message);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const deleteSingleCampaign = async (req, res) => {
  try {
    // Extract the campaign ID from the request parameters
    const { id } = req.params;

    // Find and delete the campaign by ID
    const deletedCampaign = await Campaign.findByIdAndDelete(id);

    if (!deletedCampaign) {
      return res.status(404).json({
        message: "Campaign not found.",
      });
    }

    res.status(200).json({
      message: "Campaign deleted successfully",
      data: deletedCampaign,
    });
  } catch (error) {
    console.error("Error deleting campaign:", error);

    if (error.name === "CastError" && error.kind === "ObjectId") {
      return res.status(400).json({
        message: "Invalid campaign ID.",
      });
    }

    res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// export const updateCampaign = async (req, res) => {
//   try {
//     const { id } = req.params;
//     console.log("Received update request for campaign ID:", id);
//     console.log("Request Body:", req.body);
//     console.log("Request File:", req.file);
//     // Validate the ID
//     if (!id || !mongoose.Types.ObjectId.isValid(id)) {
//       return res
//         .status(400)
//         .json({ message: "Invalid or missing campaign ID" });
//     }

//     const {
//       campaignName,
//       campaignPayout,
//       campaignCategory,
//       campaignType,
//       geo,
//       featured,
//       preferred,
//       previewLink,
//       device,
//       allowedMedia,
//       disallowedMedia,
//       description,
//     } = req.body;

//     // Update fields dynamically based on the presence of data in req.body or req.file
//     const updates = {};

//     if (campaignName) updates.campaignName = campaignName;
//     if (campaignPayout) updates.campaignPayout = campaignPayout;
//     if (campaignCategory) updates.campaignCategory = campaignCategory;
//     if (campaignType) updates.campaignType = campaignType;
//     if (geo) updates.geo = geo;
//     if (featured) updates.featured = featured;
//     if (preferred) updates.preferred = preferred;
//     if (previewLink) updates.previewLink = previewLink;
//     if (device) updates.device = device;
//     if (allowedMedia) updates.allowedMedia = allowedMedia;
//     if (disallowedMedia) updates.disallowedMedia = disallowedMedia;
//     if (description) updates.description = description;

//     // Handle the image upload
//     if (req.file) updates.image = req.file.filename;

//     // Ensure there is at least one update field
//     if (Object.keys(updates).length === 0) {
//       return res.status(400).json({ message: "No valid fields to update" });
//     }

//     const updatedCampaign = await Campaign.findByIdAndUpdate(id, updates, {
//       new: true,
//     });

//     if (!updatedCampaign) {
//       return res.status(404).json({ message: "Campaign not found" });
//     }

//     res.status(200).json({
//       message: "Campaign updated successfully",
//       campaign: updatedCampaign,
//     });
//     console.log("Request Body:", req.body);
//     console.log("Request File:", req.file);
//   } catch (error) {
//     console.error("Error updating campaign", error);
//     res
//       .status(500)
//       .json({ message: "Internal server error", error: error.message });
//   }
// };

// export const updateCampaign = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { body } = req;

//     console.log("Request Body:", body);
//     console.log("Uploaded File:", req.file);

//     // Fetch the existing campaign
//     const existingCampaign = await Campaign.findById(id);
//     if (!existingCampaign) {
//       return res.status(404).json({ error: "Campaign not found" });
//     }

//     // Parse the geo field properly
//     let geoArray = [];
//     if (Array.isArray(body.geo)) {
//       geoArray = body.geo;
//     } else if (typeof body.geo === "string") {
//       geoArray = [body.geo];
//     }

//     // Parse allowedMedia and disallowedMedia
//     const allowedMedia = body.allowedMedia
//       ? JSON.parse(body.allowedMedia)
//       : undefined;
//     const disallowedMedia = body.disallowedMedia
//       ? JSON.parse(body.disallowedMedia)
//       : undefined;

//     const updatedData = {
//       campaignName: body.campaignName,
//       campaignPayout: body.campaignPayout,
//       campaignCategory: body.campaignCategory,
//       campaignType: body.campaignType,
//       geo: geoArray.length ? geoArray : undefined,
//       featured: body.featured,
//       preferred: body.preferred,
//       previewLink: body.previewLink,
//       device: body.device,
//       allowedMedia,
//       disallowedMedia,
//       description: body.description,
//     };

//     // Handle image upload
//     if (req.file) {
//       updatedData.image = req.file.path.replace("\\", "/"); // Ensure correct path format

//       // Delete the old image if it exists
//       if (existingCampaign.image) {
//         fs.unlink(existingCampaign.image, (err) => {
//           if (err) {
//             console.error("Error deleting old image:", err.message);
//             // Optionally, handle the error (e.g., notify the user)
//           } else {
//             console.log("Old image deleted successfully");
//           }
//         });
//       }
//     }

//     // Remove undefined fields
//     Object.keys(updatedData).forEach((key) => {
//       if (updatedData[key] === undefined) {
//         delete updatedData[key];
//       }
//     });

//     const campaign = await Campaign.findByIdAndUpdate(id, updatedData, {
//       new: true,
//       runValidators: true,
//     });

//     if (!campaign) {
//       return res.status(404).json({ error: "Campaign not found" });
//     }

//     res.status(200).json({
//       message: "Campaign updated successfully",
//       campaign,
//     });
//   } catch (error) {
//     console.error("Error updating campaign:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// };

export const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;

    console.log("Request Body:", body);
    console.log("Uploaded File:", req.file);

    // Fetch the existing campaign
    const existingCampaign = await Campaign.findById(id);
    if (!existingCampaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    // Parse the geo field properly
    let geoArray = [];
    if (Array.isArray(body.geo)) {
      geoArray = body.geo;
    } else if (typeof body.geo === "string") {
      geoArray = [body.geo];
    }

    // Parse allowedMedia and disallowedMedia
    const allowedMedia = body.allowedMedia
      ? JSON.parse(body.allowedMedia)
      : undefined;
    const disallowedMedia = body.disallowedMedia
      ? JSON.parse(body.disallowedMedia)
      : undefined;

    const updatedData = {
      campaignName: body.campaignName,
      campaignPayout: body.campaignPayout,
      campaignCategory: body.campaignCategory,
      campaignType: body.campaignType,
      geo: geoArray.length ? geoArray : undefined,
      featured: body.featured,
      preferred: body.preferred,
      previewLink: body.previewLink,
      device: body.device,
      allowedMedia,
      disallowedMedia,
      description: body.description,
    };

    // Handle image upload
    if (req.file) {
      updatedData.image = `/uploads/${req.file.filename}`; // Ensure correct path format

      // Delete the old image if it exists
      if (existingCampaign.image) {
        const oldImagePath = path.join(
          __dirname,
          "../..",
          existingCampaign.image
        );
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error("Error deleting old image:", err.message);
          } else {
            console.log("Old image deleted successfully");
          }
        });
      }
    }

    // Remove undefined fields
    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] === undefined) {
        delete updatedData[key];
      }
    });

    const campaign = await Campaign.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    res.status(200).json({
      message: "Campaign updated successfully",
      campaign,
    });
  } catch (error) {
    console.error("Error updating campaign:", error.message);
    res.status(500).json({ error: error.message });
  }
};
