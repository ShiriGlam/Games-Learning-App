const fetchMock = require('jest-fetch-mock');
const dotenv = require('dotenv');

dotenv.config();
fetchMock.enableMocks();



// דוגמה נוספת להרחבות Jest
expect.extend({
  toBeValidToken(received) {
    const pass = received && received.startsWith('mocked-');
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid token`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid token`,
        pass: false,
      };
    }
  },
});
