require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async () => {
      execSync('npm run setup-db');
  
      await client.connect();
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
    }, 10000);
  
    afterAll(done => {
      return client.end(done);
    });

    // test('returns favs', async() => {

    //   const expectation = [
    //     {
    //       id: expect.any(Number),
    //       name: 'bessie',
    //       image: 'http://www.placecage.com/200/200',
    //       rating: 'great',
    //       url: 'blah',
    //       owner_id: expect.any(Number)
    //     }
    //   ];

    //   const data = await fakeRequest(app)
    //     .get('/favs')
    //     .expect('Content-Type', /json/)
    //     .expect(200);

    //   expect(data.body).toEqual(expectation);
    // });

    test('returns search', async() => {

      const expectation = [
        {
          name: expect.any(String),
          image: expect.any(String),
          rating: expect.any(Number),
          url: expect.any(String),
        }
      ];

      const data = await fakeRequest(app)
        .get('/search?q=pasta')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expect.arrayContaining(expectation));
    });
  });
});
