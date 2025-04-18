const { EntitySchema } = require("typeorm");

const Hotel = new EntitySchema({
    name: "Hotel",
    tableName: "hotels",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        name: {
            type: "varchar",
            length: 255,
            nullable: false
        },
        city: {
            type: "varchar",
            length: 100,
            nullable: false
        },
        address: {
            type: "text",
            nullable: false
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
        rooms: {
            target: "Room",
            type: "one-to-many",
            inverseSide: "hotel",
            cascade: true
        }
    }
});

module.exports = Hotel;
