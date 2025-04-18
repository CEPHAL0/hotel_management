const { EntitySchema } = require("typeorm");

const Review = new EntitySchema({
  name: "Review",
  tableName: "reviews",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true
    },
    rating: {
      type: "int",
      nullable: false
    },
    comment: {
      type: "text",
      nullable: false
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

module.exports = { Review };
