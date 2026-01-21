const router = require("express").Router();
const authorization = require("../middleware/authorization");
const bidController = require("../controllers/bidController");

router.post("/create", authorization, bidController.createBid);

router.get("/", bidController.getAllBids);

router.get("/auction/:auctionId", bidController.getBidsByAuctionId);

router.put("/update/:id", authorization, bidController.updateBid);

router.delete("/delete/:id", authorization, bidController.deleteBid);

router.get("/user/my-bids", authorization, bidController.getMyBids);

module.exports = router;


