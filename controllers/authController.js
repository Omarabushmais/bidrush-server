const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { fullname, username, email, password, phone_number } = req.body;

    const userCheck = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (userCheck.rows.length > 0) {
      const existingUser = userCheck.rows[0];
      
      if (existingUser.email === email) {
        return res.status(401).json({ message: "User already exists with this email!" });
      }

      if (existingUser.username === username) {
        return res.status(401).json({ message: "User already exists with this username!" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users (fullname, username, email, password, phone_number) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [fullname, username, email, hashedPassword, phone_number]
    );

    const token = jwt.sign(
      { user_id: newUser.rows[0].id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    res.json({ token, user: newUser.rows[0] });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};


// ==========================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (user.rows.length === 0) {
      return res.status(401).json({ message: "Invalid Email" });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    if (!validPassword) {
      return res.status(401).json({ message: "Incorrect Password" });
    }

    const token = jwt.sign(
      { user_id: user.rows[0].id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    res.json({ token, user: user.rows[0] });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = { register, login};