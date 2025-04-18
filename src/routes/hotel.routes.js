const express = require("express");
const router = express.Router();
const HotelController  = require("../controllers/hotel.controller");
const { authMiddleware, requireAdmin } = require("../middleware/auth.middleware");

// Get all hotels
router.get("/", HotelController.getHotels);

// Get a single hotel
router.get("/:id", HotelController.getHotel);

// Get rooms for a hotel
router.get("/:id/rooms", HotelController.getHotelRooms);

// Admin routes
router.use(authMiddleware, requireAdmin);

// Create hotel
router.post("/", HotelController.createHotel);

// Update hotel
router.put("/:id", HotelController.updateHotel);

// Delete hotel
router.delete("/:id", HotelController.deleteHotel);

module.exports = router; 