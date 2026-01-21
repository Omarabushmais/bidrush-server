const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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
      return res.status(400).json({ message: "Invalid Email" });
    }

    if (user.rows[0].status === 'suspended') {
        return res.status(400).json({ message: "You have been suspended." });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    if (!validPassword) {
      return res.status(400).json({ message: "Incorrect Password" });
    }

    const token = jwt.sign(
      { user_id: user.rows[0].id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "1h" }
    );

    res.json({ 
      token, 
      role: user.rows[0].role,
      username: user.rows[0].username,
      userId: user.rows[0].id
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// ===================USER PROFILE=======================

const getProfile = async (req, res) => {
  try {
    // Only fetching personal info, no admin fields
    const user = await pool.query(
      "SELECT id, fullname, username, email, phone_number, created_at FROM users WHERE id = $1",
      [req.user]
    );
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// ===================UPDATE USER PROFILE=======================

const updateProfile = async (req, res) => {
  try {
    const { fullname, username, email, phone_number } = req.body;
    
    const updateUser = await pool.query(
      "UPDATE users SET fullname = $1, username = $2, email = $3, phone_number = $4 WHERE id = $5 RETURNING *",
      [fullname, username, email, phone_number, req.user]
    );

    res.json({ message: "Profile updated successfully", user: updateUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// ===================GET ALL USERS=======================

const getAllUsers = async (req, res) => {
  try {
    const users = await pool.query(
        "SELECT id, fullname, username, email, phone_number, role, status, created_at FROM users"
    );
    res.json(users.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// ===================DELETE USER=======================

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// ===================SUSPEND PROFILE=======================
const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const suspend = await pool.query(
      "UPDATE users SET status = 'suspended' WHERE id = $1 RETURNING *", 
      [id]
    );

    if (suspend.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User suspended", user: suspend.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// ===================FORGET PASS=======================

const FRONTEND_URL = "http://localhost:5173";

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const targetUser = user.rows[0];
    const secret = process.env.JWT_SECRET + targetUser.password;
    const token = jwt.sign({ email: targetUser.email, id: targetUser.id }, secret, { expiresIn: "15m" });

    const link = `${FRONTEND_URL}/reset-password/${targetUser.id}/${token}`;
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: 'BidRush Support',
      to: email,
      subject: 'Reset Your Password - BidRush',
      text: `Click this link to reset your password: ${link}`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset link sent to your email" });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// ===================RESET PASS=======================

const resetPassword = async (req, res) => {
  const { id, token } = req.params;
  const { password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (user.rows.length === 0) return res.status(404).json({ message: "User not found" });

    const targetUser = user.rows[0];
    const secret = process.env.JWT_SECRET + targetUser.password;
    
    try {
      jwt.verify(token, secret);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or Expired Link" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashedPassword, id]);

    res.json({ message: "Password successfully reset!" });

  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

module.exports = { register, login, getProfile, updateProfile, getAllUsers, deleteUser, suspendUser, forgotPassword, resetPassword};