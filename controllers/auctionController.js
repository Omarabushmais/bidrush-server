const pool = require("../db");
const fs = require("fs");
const path = require("path");

// ===============CREATE AUCTION===============

const createAuction = async (req, res) => {
    try{
        const {title, description, category, starting_price, bid_increment, start_time, end_time} = req.body;
        const imageFiles = req.files;
        const newAuction = await pool.query(
            `INSERT INTO auctions (seller_id, title, description, category, starting_price, current_price, bid_increment, status, start_time, end_time)
             VALUES ($1, $2, $3, $4, $5, $5, $6, 'active', $7, $8) RETURNING *`,
            [req.user, title, description, category, starting_price, bid_increment, start_time, end_time]
        );

        const auctionId = newAuction.rows[0].id;

        if(imageFiles && imageFiles.length > 0){
            for(const file of imageFiles){
                const imageUrl = `/uploads/${file.filename}`;
                
                await pool.query(
                    "INSERT INTO auction_images (auction_id, image_url) VALUES ($1, $2)",
                    [auctionId, imageUrl]
                );
            }
        }

        res.json({message: "Auction Created Successfully!", auction: newAuction.rows[0] });

    } catch(err){
        console.error(err.message);
        res.status(500).json("Server Error");
    }
};

// ===============VIEW ALL AUCTION===============

const getAllAuctions = async (req, res) => {
  try {
    await pool.query(`
      UPDATE auctions SET status = 'ended'
      WHERE end_time < NOW() AND TRIM(LOWER(status)) = 'active'
    `);

    const allAuctions = await pool.query(`
      SELECT a.*, u.username, (SELECT image_url FROM auction_images WHERE auction_id = a.id LIMIT 1) AS image
      FROM auctions a JOIN users u ON a.seller_id = u.id
    `);

    res.json(allAuctions.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
};

// ===============VIEW ONE AUCTION===============

const getAuctionById = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(`
      UPDATE auctions SET status='ended'
      WHERE id = $1 AND end_time < NOW() AND TRIM(LOWER(status))='active'
    `, [id]);

    const auctionQuery = await pool.query(`
      SELECT a.*, u.username AS seller_name FROM auctions a
      JOIN users u ON a.seller_id = u.id WHERE a.id = $1
    `, [id]);

    if (auctionQuery.rows.length === 0) {
      return res.status(404).json("Auction not found");
    }

    let auction = auctionQuery.rows[0];

    const imagesQuery = await pool.query(
      "SELECT id, image_url FROM auction_images WHERE auction_id = $1",
      [id]
    );

    res.json({ ...auction, images: imagesQuery.rows });

  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
};

// ===============EDIT AUCTION===============

const updateAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, starting_price, bid_increment, start_time, end_time } = req.body;
    const imageFiles = req.files;

    const result = await pool.query(
      `UPDATE auctions SET title = $1, description = $2, category = $3, starting_price = $4, bid_increment = $5, start_time = $6, end_time = $7 
       WHERE id = $8 AND seller_id = $9 AND TRIM(LOWER(status)) = 'active' RETURNING *`,
      [title, description, category, starting_price, bid_increment, start_time, end_time, id, req.user]
    );

    if (result.rows.length === 0) {
      return res.status(403).json("Cannot edit: not yours, not found, or already completed.");
    }

    if (imageFiles && imageFiles.length > 0) {
      for (const file of imageFiles) {
        const imagePath = `/uploads/${file.filename}`;
        await pool.query(
          "INSERT INTO auction_images (auction_id, image_url) VALUES ($1, $2)",
          [id, imagePath]
        );
      }
    }

    res.json({ message: "Auction Updated Successfully", auction: result.rows[0] });

  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
};

// ===============DELETE IMAGE===============

const deleteImage = async (req, res) => {
    try {
        const { imageId } = req.params;

        const checkImage = await pool.query(
            `SELECT i.id, i.image_url FROM auction_images i 
             JOIN auctions a ON i.auction_id = a.id WHERE i.id = $1 AND a.seller_id = $2`,
            [imageId, req.user]
        );

        if (checkImage.rows.length === 0) {
            return res.status(403).json("Image not found or you are not the owner.");
        }

        const image = checkImage.rows[0];

        const filePath = path.join(__dirname, `../public${image.image_url}`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await pool.query("DELETE FROM auction_images WHERE id = $1", [imageId]);

        res.json("Image deleted successfully");

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
};

// ===============DLETE AUCTION===============

const deleteAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user;

    const userQ = await pool.query("SELECT role FROM users WHERE id = $1", [userId]);
    const userRole = userQ.rows[0]?.role;

    const auctionQ = await pool.query("SELECT * FROM auctions WHERE id = $1", [id]);
    
    if (auctionQ.rows.length === 0) {
      return res.status(404).json("Auction not found.");
    }

    const auction = auctionQ.rows[0];

    if (userRole !== 'admin' && auction.seller_id !== userId) {
       return res.status(403).json("You are not authorized to delete this auction.");
    }
    const images = await pool.query("SELECT image_url FROM auction_images WHERE auction_id = $1", [id]);
    
    images.rows.forEach(img => {
        const filePath = path.join(__dirname, `../public${img.image_url}`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    });

    await pool.query("DELETE FROM auctions WHERE id = $1", [id]);
    
    res.json("Auction Deleted Successfully");

  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
};

// ===============GET MY AUCTIONS===============

const getMyAuctions = async (req, res) => {
  try {

    const userId = Number(req.user);
    if (!userId) return res.status(401).json("Unauthorized");

    await pool.query(`
      UPDATE auctions SET status = 'ended'
      WHERE seller_id = $1 AND end_time < NOW() AND TRIM(LOWER(status)) = 'active'
    `, [userId]);

    const myAuctions = await pool.query(
      "SELECT * FROM auctions WHERE seller_id = $1",
      [userId]
    );

    res.json(myAuctions.rows);
  } catch (err) {
    console.error("getMyAuctions error:", err);
    res.status(500).json("Server Error");
  }
};

module.exports = {createAuction, getAllAuctions, getAuctionById, getMyAuctions, deleteAuction, updateAuction, deleteImage};