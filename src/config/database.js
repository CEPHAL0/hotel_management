const { DataSource } = require("typeorm");
const dotenv = require("dotenv");

dotenv.config();

const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: true,
    logging: false,
    entities: ["src/entities/*.js"],
    migrations: ["src/migrations/*.js"],
    subscribers: ["src/subscribers/*.js"],
});

module.exports = { AppDataSource }; 