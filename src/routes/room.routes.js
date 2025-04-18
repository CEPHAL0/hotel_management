const express = require("express");
const router = express.Router();
const  RoomController  = require("../controllers/room.controller");
const { authMiddleware, requireAdmin } = require("../middleware/auth.middleware");

// Get all rooms for a hotel
router.get("/hotel/:hotelId", RoomController.getRooms);

// Get a single room in a hotel
router.get("/hotel/:hotelId/:id", RoomController.getRoom);

// Admin routes
router.use(authMiddleware, requireAdmin);

// Create room in a hotel
router.post("/hotel/:hotelId", RoomController.createRoom);

// Update room in a hotel
router.put("/hotel/:hotelId/:id", RoomController.updateRoom);

// Update room status
router.put("/hotel/:hotelId/:id/status", RoomController.updateRoomStatus);

// Delete room from a hotel
router.delete("/hotel/:hotelId/:id", RoomController.deleteRoom);

module.exports = router; 