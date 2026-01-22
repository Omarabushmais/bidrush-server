const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) =>{
    try{
        const authHeader = req.header("Authorization");

        if(!authHeader){
            return res.status(403).json("Not Authorized");
        }
        const token = authHeader.split(" ")[1];

        const payload = jwt.verify(token, process.env.JWT_SECRET);

        req.user = payload.user_id;
        next();

    }catch(err){
        console.error(err.name);
        return res.status(401).json(
            err.name === "TokenExpiredError" ? "Token Expired" : "Token Invalid"
            );
    }
}
