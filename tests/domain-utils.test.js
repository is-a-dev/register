const { getDomains } = require('../utils/get-domain');

describe('getDomains', () => {
  it('should resolve with the list of domains', async () => {
    const list = await getDomains();
    expect(Array.isArray(list)).toBe(true);
  });
});

