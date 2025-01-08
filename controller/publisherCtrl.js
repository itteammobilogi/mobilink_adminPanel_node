import axios from "axios";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import Publisher from "../models/publisherModel.js";

export const createPublisher = async (req, res) => {
  try {
    const { pubName, pubEmail, pubContact, pubSkypeId, pubCompany } = req.body;

    //Validate required fields
    if (!pubName || !pubEmail || !pubContact) {
      return res
        .status(400)
        .json({ message: "All marked fields are mandatory" });
    }

    //Create New publisher
    const newPublisher = new Publisher({
      pubName,
      pubContact,
      pubEmail,
      pubCompany,
      pubSkypeId,
    });

    const savedPublisher = await newPublisher.save();

    // sent confirmation mail once pub created
    await sendConfirmationMail(savedPublisher.pubEmail, savedPublisher.pubName);

    return res.status(201).json({
      message:
        "Publisher created successfully. A confirmation mail has been sent",
      publisher: savedPublisher,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Email already exist",
      });
    }
    console.error("Error creating publisher:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//Function to send confirmation mail
const sendConfirmationMail = async (email, name) => {
  console.log("Email:", email); // Log to check if the email is coming through correctly
  console.log("Name:", name);
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "devops@demandesk.com",
      pass: "kxho xezk iugo plsq",
    },
  });

  //Email options
  const mailOptions = {
    from: '"Mobilogi technologies" <devops@demandesk.com>',
    to: email,
    subject: "Thank you for registering with us",
    text: `Dear ${name}, Thank you for registering as a publisher. We are currently reviewing your profile and will get back to you shortly once your ID has been created.If you have any questions, feel free to contact us.
    Best regards,
    Mobilogi Technology Pvt Ltd [MTPL]`,
  };
  //Send mail
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Propagate the error to handle it later
  }
};

export const createPublisherInTrackier = async (req, res) => {
  const { name, email, password, company } = req.body;

  // Trackier API endpoint
  const TRACKIER_API_KEY = "66acdc92f218ea3997a9e61771d66acdc92f21c2";

  const TRACKIER_API_URL = `https://api.trackier.com/v2/publishers?apiKey=${TRACKIER_API_KEY}`;

  try {
    console.log("Request being sent to Trackier API:", {
      url: TRACKIER_API_URL,
      headers: {
        "Content-Type": "application/json",
      },
      body: { name, email, password, company },
    });

    const response = await axios.post(
      TRACKIER_API_URL,
      {
        name,
        email,
        password,
        company,
      },
      {
        headers: {
          //Authorization: `Bearer ${TRACKIER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Publisher created Successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Error creating publisher:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create publisher",
      error: error.response?.data || error.message,
    });
  }
};

//controller for fetching and updating publisher from admin panel

export const getPublisher = async (req, res) => {
  try {
    // Extract query parameters
    const { search, page, limit } = req.query;

    // Convert page and limit to integers
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Create a filter object for search
    const filter = {};
    if (search) {
      filter.name = { $regex: search, $options: "i" }; // Assuming 'name' is a field in your 'publishers' collection
    }

    // Calculate skip for pagination
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch publishers with search, pagination, and limit
    const publishers = await mongoose.connection.db
      .collection("publishers")
      .find(filter)
      .skip(skip)
      .limit(limitNumber)
      .toArray();

    // Get the total count of documents matching the filter
    const totalPublishers = await mongoose.connection.db
      .collection("publishers")
      .countDocuments(filter);

    // Send response
    res.status(200).json({
      success: true,
      data: publishers,
      meta: {
        total: totalPublishers,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(totalPublishers / limitNumber),
      },
    });
  } catch (error) {
    console.error("Error fetching publishers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch publishers",
      error: error.message,
    });
  }
};

// export const updatePublisher = async(req, res) => {
//     const {pubId, pubStatus} = req.body;

//     if (!mongoose.Types.ObjectId.isValid(pubId)) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid Publisher ID",
//         });
//       }

//     try{

//         const updateResponse = await mongoose.connection.db.collection("publishers").updateOne(
//             {_id: new mongoose.Types.ObjectId(pubId) },
//             { $set:{pubStatus: pubStatus}}
//         );

//         if (updateResponse.matchedCount === 0) {
//             return res.status(404).json({
//               success: false,
//               message: "Publisher not found",
//             });
//           }

//         if(pubStatus === "Active"){
//             const TRACKIER_API_KEY = '66acdc92f218ea3997a9e61771d66acdc92f21c2';
//             const TRACKIER_API_URL = `https://api.trackier.com/v2/publishers?apiKey=${TRACKIER_API_KEY}`;

//             //Fetch pub from mongodbto send to trackier
//              const publisher = await mongoose.connection.db.collection("publishers").findOne({ _id: new mongoose.Types.ObjectId(pubId) });
//              console.log("Fetched Publisher:", publisher);
//              const trackierResponse = await axios.post(TRACKIER_API_URL,{
//                 name: publisher.pubName,
//         email: publisher.pubEmail,
//         company: publisher.pubCompany,
//              });

//              console.log("Trackier API Response:", trackierResponse.data);

//              res.status(200).json({
//                 success: true,
//         message: "Publisher updated and created in Trackier",
//         data: trackierResponse.data,
//              });
//         }

//         else{
//             res.status(200).json({
//                 success: true,
//                 message: "Publisher status updated",
//               });
//         }
//     }

//     catch (error) {
//         console.error("Error updating publisher status:", error);
//         res.status(500).json({
//           success: false,
//           message: "Failed to update publisher status or create in Trackier",
//           error: error.message,
//         });
//       }
// }

export const updatePublisher = async (req, res) => {
  const { pubId, pubStatus } = req.body;

  if (!mongoose.Types.ObjectId.isValid(pubId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Publisher ID",
    });
  }

  try {
    const publisher = await mongoose.connection.db
      .collection("publishers")
      .findOne({ _id: new mongoose.Types.ObjectId(pubId) });

    if (!publisher) {
      return res.status(404).json({
        success: false,
        message: "Publisher not found in database",
      });
    }

    if (pubStatus === "Active") {
      const generateRandomPassword = () => {
        return Math.random().toString(36).slice(-8) + "@123";
      };

      const password = generateRandomPassword();

      const TRACKIER_API_KEY = "66acdc92f218ea3997a9e61771d66acdc92f21c2";
      const TRACKIER_API_URL = `https://api.trackier.com/v2/publishers?apiKey=${TRACKIER_API_KEY}`;

      try {
        const trackierResponse = await axios.post(TRACKIER_API_URL, {
          name: publisher.pubName,
          email: publisher.pubEmail,
          password: password,
          company: publisher.pubCompany,
        });

        console.log("Trackier API Response:", trackierResponse.data);

        // Save password and status to MongoDB
        await mongoose.connection.db
          .collection("publishers")
          .updateOne(
            { _id: new mongoose.Types.ObjectId(pubId) },
            { $set: { trackierPassword: password, pubStatus: pubStatus } }
          );

        // Send credentials via email
        await sendPubCredentialsViaMail(
          publisher.pubEmail,
          publisher.pubName,
          password
        );

        return res.status(200).json({
          success: true,
          message: "Publisher updated, created in Trackier, and email sent.",
          data: trackierResponse.data,
        });
      } catch (trackierError) {
        console.error(
          "Trackier API Error:",
          trackierError.response?.data || trackierError.message
        );

        const trackierErrorMessage =
          trackierError.response?.data?.errors?.[0]?.message ||
          "Failed to create publisher in Trackier";

        return res.status(500).json({
          success: false,
          message: "Failed to create publisher in Trackier",
          error: trackierError.response?.data || trackierErrorMessage,
        });
      }
    } else {
      return res.status(200).json({
        success: true,
        message: "Publisher status updated",
      });
    }
  } catch (error) {
    console.error("Error updating publisher status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update publisher status",
      error: error.message,
    });
  }
};

// Function to create mail when pub is being added in trackier
const sendPubCredentialsViaMail = async (email, name, password) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "devops@demandesk.com",
      pass: "kxho xezk iugo plsq",
    },
  });

  //Email options

  const mailOptions = {
    from: '"Mobilinks Mobilogi Technologies" <devops@demandesk.com>',
    to: email,
    subject: "Profile Activation",
    text: `Dear ${name}
        Your Request for creating Publisher has been accepted ON Mobilinks mobilinks.mobilogi.com
        Please find your Account credentials below:
        Panel link : https://mobilogi.trackier.io/login.html 
        email : ${email}
        password : ${password}
        
        Best Wishes for your Affiliate Journey`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("email sent successflly");
  } catch (error) {
    console.log("Error sending mail", error);
  }
};

export const deletePublisher = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCampaign = await Publisher.findByIdAndDelete(id);

    if (!deletedCampaign) {
      return res.status(404).json({
        message: "publisher not found.",
      });
    }

    res.status(200).json({
      message: "Publisher deleted successfully",
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
