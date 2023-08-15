import request from 'supertest';
import app from '../src/app.js';

describe('Test / endpoint', () => {
  it('should respond with a JSON message', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Hello, World!' });
  });
});
