const cron = require('node-cron');
const axios = require('axios');

// Gọi API cứ mỗi 10 phút
cron.schedule(' */30 * * * * *', async () => {
    try {
        const response = await axios.get('https://youtube-fullstack-nodejs-forbeginer.onrender.com/api/product?page=1&limit=10');
        console.log('[Cron] API gọi thành công lúc:', new Date(), response.data);
    } catch (err) {
        console.error('[Cron] Lỗi gọi API:', err.message);
    }
});
