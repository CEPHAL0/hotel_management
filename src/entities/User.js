const { EntitySchema } = require("typeorm");

const UserRole = {
  ADMIN: "admin",
  USER: "user"
};

const User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    name: {
      type: "varchar",
      nullable: false
    },
    email: {
      type: "varchar",
      unique: true,
      nullable: false
    },
    password: {
      type: "varchar",
      nullable: false
    },
    role: {
      type: "enum",
      enum: UserRole,
      default: UserRole.USER
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
    bookings: {
      type: "one-to-many",
      target: "Booking",
      inverseSide: "user"
    },
    stays: {
      type: "one-to-many",
      target: "Stay",
      inverseSide: "user"
    },
    reviews: {
      type: "one-to-many",
      target: "Review",
      inverseSide: "user"
    },
    payments: {
      type: "one-to-many",
      target: "Payment",
      inverseSide: "user"
    }
  }
});

module.exports = { User, UserRole };
