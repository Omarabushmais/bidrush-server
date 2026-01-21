const pool = require("../db");

// =============== CREATE BID ===============
const createBid = async (req, res) => {
    try {
        const { auction_id, amount } = req.body;
        const bidder_id = req.user; 

        const auctionCheck = await pool.query("SELECT * FROM auctions WHERE id = $1", [auction_id]);

        if (auctionCheck.rows.length === 0) {
            return res.status(404).json("Auction not found");
        }

        const auction = auctionCheck.rows[0];

        if (auction.status !== 'active') {
            return res.status(400).json("Auction is not active");
        }
        if (auction.seller_id === bidder_id) {
            return res.status(403).json("You cannot bid on your own auction");
        }

        if (parseFloat(amount) <= parseFloat(auction.current_price)) {
            return res.status(400).json("Bid must be higher than current price");
        }

        await pool.query(
            "UPDATE bids SET status = 'Outbid' WHERE auction_id = $1", 
            [auction_id]
        );

        const newBid = await pool.query(
            "INSERT INTO bids (auction_id, bidder_id, amount, status) VALUES ($1, $2, $3, 'Winning') RETURNING *",
            [auction_id, bidder_id, amount]
        );

        await pool.query(
            "UPDATE auctions SET current_price = $1 WHERE id = $2",
            [amount, auction_id]
        );

        res.json({ message: "Bid placed successfully!", bid: newBid.rows[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
};

// =============== GET ALL BIDS ===============
const getAllBids = async (req, res) => {
    try {
        const allBids = await pool.query("SELECT * FROM bids");
        res.json(allBids.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
};

// =============== GET BIDS FOR SPECIFIC AUCTION ===============
const getBidsByAuctionId = async (req, res) => {
    try {
        const { auctionId } = req.params;

        const bids = await pool.query(
            `SELECT b.*, u.username 
             FROM bids b 
             JOIN users u ON b.bidder_id = u.id 
             WHERE b.auction_id = $1 
             ORDER BY b.amount DESC`, 
            [auctionId]
        );

        res.json(bids.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
};

// =============== DELETE BID ===============
const deleteBid = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user;
        const userCheck = await pool.query("SELECT role FROM users WHERE id = $1", [userId]);
        
        if (userCheck.rows.length === 0 || userCheck.rows[0].role !== 'admin') {
            return res.status(403).json("Access Denied. Only Admins can delete bids.");
        }
        const deleteOp = await pool.query("DELETE FROM bids WHERE id = $1 RETURNING *", [id]);

        if (deleteOp.rows.length === 0) {
            return res.status(404).json("Bid not found");
        }

        res.json("Bid Deleted Successfully by Admin");

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
};

// =============== UPDATE BID ===============
const updateBid = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;

        const checkBid = await pool.query("SELECT * FROM bids WHERE id = $1 AND bidder_id = $2", [id, req.user]);

        if (checkBid.rows.length === 0) {
            return res.status(403).json("Bid not found or it's not yours.");
        }

        const currentBid = checkBid.rows[0];

        await pool.query(
            "UPDATE bids SET status = 'Outbid' WHERE auction_id = $1 AND id != $2",
            [currentBid.auction_id, id]
        );

        const update = await pool.query(
            "UPDATE bids SET amount = $1, created_at = NOW(), status = 'Winning' WHERE id = $2 RETURNING *",
            [amount, id]
        );

        await pool.query(
            "UPDATE auctions SET current_price = $1 WHERE id = $2",
            [amount, currentBid.auction_id]
        );

        res.json({ message: "Bid Updated", bid: update.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
};



// ===================MYBIDS==========================

const getMyBids = async (req, res) => {
    try {
        const myBids = await pool.query(
            `SELECT b.*, a.title, a.status AS auction_status, a.end_time, a.current_price as auction_current_price
             FROM bids b
             JOIN auctions a ON b.auction_id = a.id
             WHERE b.bidder_id = $1
             ORDER BY b.created_at DESC`,
            [req.user]
        );
        res.json(myBids.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
};

module.exports = { createBid, getAllBids, getBidsByAuctionId, deleteBid, updateBid , getMyBids};
