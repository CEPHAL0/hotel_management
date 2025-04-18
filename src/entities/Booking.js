const { EntitySchema } = require("typeorm");

const BookingStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed"
};

const Booking = new EntitySchema({
  name: "Booking",
  tableName: "bookings",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    checkInDate: {
      type: "date",
      nullable: false
    },
    checkOutDate: {
      type: "date",
      nullable: false
    },
    guests: {
      type: "int",
      nullable: false
    },
    totalPrice: {
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false
    },
    status: {
      type: "enum",
      enum: BookingStatus,
      default: BookingStatus.PENDING
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
    user: {
      type: "many-to-one",
      target: "User", // Entity name, not variable
      joinColumn: true,
      eager: false,
      nullable: false
    },
    room: {
      type: "many-to-one",
      target: "Room",
      joinColumn: true,
      eager: false,
      nullable: false
    },
    payments: {
      type: "one-to-many",
      target: "Payment",
      inverseSide: "booking",
      eager: false
    }
  }
});

module.exports = { BookingStatus, Booking };
