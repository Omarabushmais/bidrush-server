const router = require("express").Router();
const authorization = require("../middleware/authorization");
const auctionController = require("../controllers/auctionController");

const upload = require("../middleware/upload");

router.post("/create", authorization, upload.array("images", 5), auctionController.createAuction);

router.get("/", auctionController.getAllAuctions);

router.get("/user/my-auctions", authorization, auctionController.getMyAuctions);

router.get("/:id", auctionController.getAuctionById);

router.delete("/delete/:id", authorization, auctionController.deleteAuction);

router.delete("/image/:imageId", authorization, auctionController.deleteImage);

router.put("/edit/:id", authorization, upload.array("images", 5), auctionController.updateAuction);

module.exports = router;