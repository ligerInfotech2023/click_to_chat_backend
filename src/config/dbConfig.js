const mongoose = require('mongoose');

const dbConn = mongoose
    .connect(process.env.LIVE_DB_STRING, {  })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(error => {
        console.log('Connection Error: ',error);
    })

module.exports = dbConn;
