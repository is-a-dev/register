const log = (level, msg, data = null) => {
    const time = new Date().toISOString();
    console.log(`[${time}] [${level}] ${msg}`, data || '');
};

module.exports = {
    info: (m, d) => log('INFO', m, d),
    error: (m, d) => log('ERROR', m, d),
    debug: (m, d) => log('DEBUG', m, d)
};
