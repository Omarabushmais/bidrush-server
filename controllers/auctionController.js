const pool = require("../db");

const fs = require("fs");
const path = require("path");

// ===============CREATE AUCTION===============

const createAuction = async (req, res) => {
    try{
        const {title, description, category, starting_price, bid_increment, start_time, end_time} = req.body;
        
        const imageFiles = req.files;

        const newAuction = await pool.query(
            `INSERT INTO auctions (
                seller_id, title, description, category, starting_price, current_price, bid_increment, status, start_time, end_time
            ) VALUES ($1, $2, $3, $4, $5, $5, $6, 'active', $7, $8) 
            RETURNING *`,
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
    const allAuctions = await pool.query(`
      SELECT a.*, (SELECT image_url FROM auction_images WHERE auction_id = a.id LIMIT 1) as image FROM auctions a
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
    const auction = await pool.query("SELECT * FROM auctions WHERE id = $1", [id]);

    if (auction.rows.length === 0) {
      return res.status(404).json("Auction not found");
    }

    const images = await pool.query("SELECT id, image_url FROM auction_images WHERE auction_id = $1", [id]);
    res.json({ ...auction.rows[0], images: images.rows });

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
      `UPDATE auctions 
       SET title = $1, description = $2, category = $3, starting_price = $4, bid_increment = $5, start_time = $6, end_time = $7 
       WHERE id = $8 AND seller_id = $9 RETURNING *`,
      [title, description, category, starting_price, bid_increment, start_time, end_time, id, req.user]
    );

    if (result.rows.length === 0) {
      return res.status(403).json("This auction is not yours or does not exist.");
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

const deleteImage = async (req, res) => {
    try {
        const { imageId } = req.params;

        const checkImage = await pool.query(
            `SELECT i.id, i.image_url 
             FROM auction_images i 
             JOIN auctions a ON i.auction_id = a.id 
             WHERE i.id = $1 AND a.seller_id = $2`,
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

    const checkAuction = await pool.query("SELECT * FROM auctions WHERE id = $1 AND seller_id = $2", [id, req.user]);
    
    if (checkAuction.rows.length === 0) {
      return res.status(403).json("This auction is not yours or does not exist.");
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
    const myAuctions = await pool.query("SELECT * FROM auctions WHERE seller_id = $1", [req.user]);
    res.json(myAuctions.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Server Error");
  }
};

module.exports = {createAuction, getAllAuctions, getAuctionById, getMyAuctions, deleteAuction, updateAuction, deleteImage};