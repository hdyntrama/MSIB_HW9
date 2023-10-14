const express= require ('express');
const movieRouter= express.Router();
const pool = require('../database.js');
const jwt = require('jsonwebtoken')
const JWT_SECRET = "f4973e1e-a81b-415e-b9c0-70d95d5b7481"

movieRouter.use((req, res, next) => {  
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

movieRouter.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  pool.query(
    `SELECT COUNT(*) FROM movies`, 
    (err, countResult) => {
      if (err) {
        console.error(err);
        return res.status(500).json(err);
      }

      const totalCount = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(totalCount / limit);

      pool.query(
        `SELECT * FROM movies LIMIT $1 OFFSET $2`,
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


  movieRouter.get('/:movieId', (req, res) => {
    const movieId = req.params.movieId;
    pool.query('SELECT * FROM movies WHERE id = $1', [movieId], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Gagal mengambil data dari database' });
      }
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Film tidak ditemukan' });
      }
  
      res.json(result.rows[0]);
    });
  });
  movieRouter.post('/insert', (req,res)=>{
    pool.query(
     `INSERT INTO movies ("id", "title", "genres", "year") VALUES ($1, $2, $3, $4)`,
    [req.body.id, req.body.title, req.body.genres, req.body.year],
    (err, result) => {
      if (err){
      console.error (err)
        res.status(500).json(err)
      } 
      res.status(201).json({status: 'success'})
    });
  });

  movieRouter.put('/update', (req,res)=>{
    pool.query(
      `UPDATE movies SET genres = '${req.body.genres}' WHERE id = ${req.body.id}`,
    (err, result) => {
      if (err){
      console.error (err)
        res.status(500).json(err)
      } 
      res.status(201).json({status: 'success'})
    });
  });

  movieRouter.delete('/delete', (req,res)=>{
    pool.query(
      `DELETE FROM movies WHERE id = ${req.body.id}`,
    (err, result) => {
      if (err){
      console.error (err)
        res.status(500).json(err)
      } 
      res.status(201).json({status: 'success'})
    });
  });

  module.exports = movieRouter;