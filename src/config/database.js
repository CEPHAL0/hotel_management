const { DataSource } = require("typeorm"); // Import DataSource class
const { User } = require("../entities/User");
const { Booking } = require("../entities/Booking");
const { Room } = require("../entities/Room");
const { Stay } = require("../entities/Stay");
const { Review } = require("../entities/Review");
const { Payment } = require("../entities/Payment");

const AppDataSource = new DataSource({
    type: "mysql",  // Use mysql or another database type
    host: "localhost",
    port: 3306,
    username: "root",  // Your DB username
    password: "",  // Your DB password
    database: "hotel_management_system_js",  // Your DB name
    entities: [
        User,
        Booking,
        Room,
        Stay,
        Review,
        Payment
    ],
    synchronize: true,  // This is useful for development (will auto create tables)
    logging: false,
});

module.exports = { AppDataSource };
