const express = require("express");
const router = express.Router();
const HotelController = require("../controllers/hotel.controller");
const { authMiddleware, requireAdmin } = require("../middleware/auth.middleware");
const { handleMulterError } = require("../utils/fileUpload");

// Get all hotels
router.get("/", HotelController.getHotels);

// Get a single hotel
router.get("/:id", HotelController.getHotel);

// Get rooms for a hotel
router.get("/:id/rooms", HotelController.getHotelRooms);

// Admin routes
router.use(authMiddleware, requireAdmin);

// Create hotel with image upload
router.post("/", 
    HotelController.uploadHotelImage,
    handleMulterError,
    HotelController.createHotel
);

// Update hotel with image upload
router.put("/:id", 
    HotelController.uploadHotelImage,
    handleMulterError,
    HotelController.updateHotel
);

// Delete hotel
router.delete("/:id", 
    HotelController.deleteHotel
);

module.exports = router; 