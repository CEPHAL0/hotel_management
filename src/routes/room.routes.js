const express = require("express");
const router = express.Router();
const RoomController = require("../controllers/room.controller");
const { authMiddleware, requireAdmin } = require("../middleware/auth.middleware");
const { handleMulterError } = require("../utils/fileUpload");

// Search rooms (must be before /:id route)
router.get("/search", RoomController.searchRooms);

// Get all rooms for a hotel
router.get("/hotel/:hotelId", RoomController.getRooms);

// Get a single room
router.get("/:id", RoomController.getRoom);

// Admin routes
router.use(authMiddleware, requireAdmin);

// Create room with image upload
router.post("/hotel/:hotelId", 
    RoomController.uploadRoomImage,
    handleMulterError,
    RoomController.createRoom
);

// Update room with image upload
router.put("/:id", 
    RoomController.uploadRoomImage,
    handleMulterError,
    RoomController.updateRoom
);

// Update room status
router.patch("/:id/status", RoomController.updateRoomStatus);

// Delete room
router.delete("/:id", RoomController.deleteRoom);

module.exports = router; 