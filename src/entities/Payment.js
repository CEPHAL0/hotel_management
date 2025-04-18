const { EntitySchema } = require("typeorm");

const PaymentStatus = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
};

const Payment = new EntitySchema({
    name: "Payment",
    tableName: "payments",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true
        },
        amount: {
            type: "decimal",
            precision: 10,
            scale: 2,
            nullable: false
        },
        currency: {
            type: "varchar",
            length: 3,
            nullable: false
        },
        stripePaymentId: {
            type: "varchar",
            nullable: false
        },
        status: {
            type: "enum",
            enum: PaymentStatus,
            default: PaymentStatus.PENDING
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
        booking: {
            type: "many-to-one",
            target: "Booking",
            joinColumn: true,
            eager: false,
            nullable: false
        },
        user: {
            type: "many-to-one",
            target: "User",
            joinColumn: true,
            eager: false,
            nullable: false
        }
    }
});

module.exports = { PaymentStatus, Payment };
