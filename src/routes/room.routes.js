const { Router } = require("express");
const { RoomController } = require("../controllers/room.controller");
const { validateRequest } = require("../middleware/validation.middleware");
const { CreateRoomDto, UpdateRoomDto, UpdateRoomStatusDto } = require("../dto/room.dto");
const { asyncHandler } = require("../utils/asyncHandler");
const { authMiddleware, requireAdmin } = require("../middleware/auth.middleware");

const router = Router();

// Public routes
router.get("/", asyncHandler(RoomController.getRooms));
router.get("/:id", asyncHandler(RoomController.getRoom));

// Admin protected routes
router.use(authMiddleware, requireAdmin);
router.post("/", validateRequest(CreateRoomDto), asyncHandler(RoomController.createRoom));
router.patch("/:id", validateRequest(UpdateRoomDto), asyncHandler(RoomController.updateRoom));
router.patch("/:id/status", validateRequest(UpdateRoomStatusDto), asyncHandler(RoomController.updateRoomStatus));
router.delete("/:id", asyncHandler(RoomController.deleteRoom));

module.exports = router; 