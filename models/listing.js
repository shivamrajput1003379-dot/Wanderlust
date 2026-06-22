const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");
const { required, string } = require("joi");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },

  description: String,

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  image: {
    filename: {
      type: String,
      default: "listingimage",
    },
    url: {
      type: String,
    },
  },

  price: {
    type: Number,
    default: 0,
    set: (v) => (v === "" ? 0 : v),
  },
  location: String,
  country: String,

  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
      required: true,
    },
    coordinates: {
      type: [Number],
      default: [77.209, 28.6139], // Delhi default
      requires: true,
    },
  },

  category: {
    type: String,
    enum: [
      "rooms",
      "iconic cities",
      "castles",
      "amazing pools",
      "camping",
      "farms",
      "arctic",
      "domes",
      "boats",
    ],
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
