const express = require('express');
const userRouter = express.Router();
const pool = require('../database.js');
const jwt = require('jsonwebtoken');
const JWT_SECRET = "f4973e1e-a81b-415e-b9c0-70d95d5b7481"



userRouter.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const query = 'SELECT email, password FROM users WHERE email = $1';

  pool.query(query, [email], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Gagal mengambil data dari database' });
    }

    if (result.rows.length === 0) {
      return res.status(401).json({
        description: 'Email tidak ditemukan',
      }).end();
    }

  
    const user = result.rows[0];
    if (password === user.password) {
      
      const token = jwt.sign({
        email: email,
      }, JWT_SECRET);

      return res.status(200).json({
        token: token
      });
    } else {
      res.status(401).json({
        description: 'Kata sandi tidak sesuai'
      }).end();
    }
  });
});

userRouter.use((req, res, next) => {  
  const token = req.header('jwt-token')

  try {
    jwt.verify(token, JWT_SECRET)
    next(); 
  } catch (error) {
    res.status(401).json({
      description: 'Token tidak valid',
    });
  }
});

  userRouter.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
  
    pool.query(
      `SELECT COUNT(*) FROM users`, 
      (err, countResult) => {
        if (err) {
          console.error(err);
          return res.status(500).json(err);
        }
  
        const totalCount = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalCount / limit);
  
        pool.query(
          `SELECT * FROM users LIMIT $1 OFFSET $2`,
          [limit, offset],
          (err, result) => {
            if (err) {
              console.error(err);
              return res.status(500).json(err);
            }
  
            res.json({
              data: result.rows,
              totalItems: totalCount,
              totalPages: totalPages,
              currentPage: page,
            });
          }
        );
      }
    );
  });
  

module.exports = userRouter;