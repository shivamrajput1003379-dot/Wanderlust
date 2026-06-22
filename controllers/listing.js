const Listing = require("../models/listing.js");
const { cloudinary } = require("../cloudConfig.js");


module.exports.indexListing = async(req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index", {allListings});
};

module.exports.newListing = (req, res) => {
    const defaultListing = {
        geometry: {
            coordinates: [77.2090, 28.6139]
        }
    };
    res.render("listings/new.ejs", {listing: defaultListing});
};

module.exports.showListing = async(req, res) => {
        let {id} = req.params;

        const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author"
            },
        })
        .populate("owner");

        if(!listing) {
            req.flash("error", "Listing you requested for does not exist!");
            return res.redirect("/listings");
        }
    
        console.log("Owner =", listing.owner);
        res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async (req, res, next) => {
    try {
        let url = req.file.path;
        let filename = req.file.filename;

        if(!req.body.listing) {
            throw new ExpressError(400, "Invalid listing data!");
        }

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };


        const lat = req.body.listing.latitude ? Number(req.body.listing.latitude) : 28.6139;
        const lng = req.body.listing.longitude ? Number(req.body.listing.longitude) : 77.2090;


        newListing.geometry = {
            type: "Point",
            coordinates: [lng, lat]
        };

        await newListing.save();
        
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");  
    } catch(err) {
        next(err);
    }
};

module.exports.editListing = async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    let defaultListing = listing.geometry.coordinates;
    let originalImageUrl = listing.image.url;
    originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", {listing, originalImageUrl, defaultListing});
};

module.exports.updateListing = async(req, res) => {
    if(!req.body.listing) {
        throw new ExpressError(400, "Invalid listing data!");
    }

    let {id} = req.params;

    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    //Agar user ne edit karte waqt location badli hai, to new coordinates update karein
    const lat = req.body.listing.latitude ? Number(req.body.listing.latitude) : null;
    const lng = req.body.listing.longitude ? Number(req.body.listing.longitude) : null;

    if (lat && lng) {
        listing.geometry = {
            type: "Point",
            coordinates: [lng, lat]
        };
        await listing.save();
    }
    
    
    if(typeof req.file !== "undefined") {

        if (listing.image && listing.image.filename) {
            await cloudinary.uploader.destroy(listing.image.filename);
        }
        
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};


module.exports.destroyListing = async(req, res) => {
    let { id } = req.params;

    // 1. Pehle database se listing dhoondhein taaki image ka filename mil sake
    let listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    // 2. Agar listing me image hai aur uska filename (Public ID) exist karta hai
    if (listing.image && listing.image.filename) {
        // Cloudinary se image delete karein
        await cloudinary.uploader.destroy(listing.image.filename);
        console.log("Cloudinary se image delete ho gayi!");
    }

    // 3. Ab database se listing ko delete karein
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log("Database se delete hui listing:", deletedListing);

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};