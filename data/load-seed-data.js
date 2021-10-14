const client = require('../lib/client');
// import our seed data:
const favs = require('./favs.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      favs.map(fav => {
        return client.query(`
                    INSERT INTO favs (name, image, rating, url, owner_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
        [fav.name, fav.image, fav.rating, fav.url, user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
