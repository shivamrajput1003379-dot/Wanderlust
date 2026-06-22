const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const Mongo_URL = 'mongodb://127.0.0.1:27017/wanderlust';

main()
    .then(() => {
        console.log("connected to DB");
        initDB();
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(Mongo_URL);
}

const initDB = async () => {
    try {
        const user = await User.findOne();
        console.log("User ID:", user._id);

        await Listing.deleteMany({});

        initData.data = initData.data.map((obj) => ({
            ...obj, 
            owner: "6a1efd0ced6c409df784281a",
        }));

        await Listing.insertMany(initData.data);
        console.log("data was initialized");
    } catch (err) {
        console.log("Data initialization error:", err);
    }
};
