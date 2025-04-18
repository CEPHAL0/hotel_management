const { EntitySchema } = require("typeorm");

const RoomType = {
  SINGLE: "single",
  DOUBLE: "double",
  SUITE: "suite",
  DELUXE: "deluxe"
};

const RoomStatus = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  MAINTENANCE: "maintenance"
};

const Room = new EntitySchema({
  name: "Room",
  tableName: "rooms",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    roomNumber: {
      type: "varchar",
      nullable: false
    },
    type: {
      type: "enum",
      enum: RoomType,
      nullable: false
    },
    price: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false
    },
    capacity: {
      type: "int",
      nullable: false
    },
    status: {
      type: "enum",
      enum: RoomStatus,
      default: RoomStatus.AVAILABLE
    },
    description: {
      type: "text",
      nullable: true
    },
    createdAt: {
      type: "timestamp",
      createDate: true
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true
    }
  },
  relations: {
    hotel: {
      type: "many-to-one",
      target: "Hotel",
      inverseSide: "rooms",
      nullable: false
    },
    bookings: {
      type: "one-to-many",
      target: "Booking",
      inverseSide: "room"
    },
    stays: {
      type: "one-to-many",
      target: "Stay",
      inverseSide: "room"
    },
    reviews: {
      type: "one-to-many",
      target: "Review",
      inverseSide: "room"
    }
  }
});

module.exports = { Room, RoomType, RoomStatus };
