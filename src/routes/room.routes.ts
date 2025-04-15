import { Router } from "express";
import { RoomController } from "../controllers/room.controller";
import { validateRequest } from "../middleware/validation.middleware";
import { CreateRoomDto, UpdateRoomDto, UpdateRoomStatusDto } from "../dto/room.dto";
import { asyncHandler } from "../utils/asyncHandler";
import { authMiddleware, requireAdmin } from "../middleware/auth.middleware";

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

export default router;