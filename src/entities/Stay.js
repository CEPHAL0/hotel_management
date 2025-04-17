const { EntitySchema } = require("typeorm");

const StayStatus = {
  ACTIVE: "active",
  COMPLETED: "completed"
};

const Stay = new EntitySchema({
  name: "Stay",
  tableName: "stays",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    startDate: {
      type: "date",
      nullable: false
    },
    endDate: {
      type: "date",
      nullable: false
    },
    totalDays: {
      type: "int",
      nullable: false
    },
    status: {
      type: "enum",
      enum: StayStatus,
      default: StayStatus.ACTIVE
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
      target: "User",
      joinColumn: true,
      nullable: false
    },
    room: {
      type: "many-to-one",
      target: "Room",
      joinColumn: true,
      nullable: false
    }
  }
});

module.exports = { Stay, StayStatus };
