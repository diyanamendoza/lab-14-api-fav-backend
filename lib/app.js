const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const request = require('superagent');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');
const { editedYelpData } = require('./utils.js');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

//search route that gets raw yelp data
app.get('/search', async(req, res) => {
  try {
    const lat = 45.5152;
    const lon = -122.6784;
    const response = await request.get(`https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${lon}&term=${req.query.q}`).set('Authorization', `Bearer ${process.env.YELP_KEY}`);
    
    const editedResponse = editedYelpData(response.body.businesses);
    res.json(editedResponse);

  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

//the favs route get
app.get('/api/favs', async(req, res) => {
  try {
    const data = await client.query('SELECT * from favs WHERE owner_id = $1', [req.userId]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

//the favs route delete
app.delete('/api/favs/:id', async(req, res) => {
  try {
    const data = await client.query('DELETE from favs WHERE favs.id = $1 AND owner_id = $2 RETURNING *', [req.params.id, req.userId]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

//the favs route post
app.post('/api/favs', async(req, res) => {
  try {
    const data = await client.query('INSERT into favs (name, image, url, rating, owner_id) VALUES( $1, $2, $3, $4, $5) RETURNING *', [req.body.name, req.body.image, req.body.url, req.body.rating, req.userId]);
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;

