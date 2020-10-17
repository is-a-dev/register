const { getDomains } = require('../utils/domain');

describe('getDomains', () => {
  it('should resolve with the list of domains', async () => {
    const list = await getDomains();
    expect(Array.isArray(list)).toBe(true);
  });
});

