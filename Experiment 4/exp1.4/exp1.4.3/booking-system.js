const { createClient } = require("redis");

const client = createClient();

client.on("error", (err) => {
    console.log("Redis Error:", err);
});

(async () => {
    await client.connect();
    console.log("Redis connected");
})();

let availableSeats = 100;

exports.bookSeat = async (req, res) => {
    const lockKey = "seat-lock";

    try {
        const lock = await client.set(lockKey, "locked", {
            NX: true,
            EX: 5
        });

        if (!lock) {
            return res.status(400).json({
                success: false,
                message: "Seat is currently being booked. Please try again."
            });
        }

        if (availableSeats <= 0) {
            await client.del(lockKey);
            return res.status(400).json({
                success: false,
                message: "No seats available"
            });
        }

        availableSeats--;

        const bookingId = "BOOK" + Date.now();

        await client.del(lockKey);

        res.status(200).json({
            success: true,
            bookingId: bookingId,
            remainingSeats: availableSeats
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};
