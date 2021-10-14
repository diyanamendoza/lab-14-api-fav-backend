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
app.get('/favs', async(req, res) => {
  try {
    const data = await client.query('SELECT * from favs');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
