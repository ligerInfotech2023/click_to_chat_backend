require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path')
const dbConn = require('./src/config/dbConfig')

const routes = require('./src/routes/indexRoute');
const HandleErrorMessage = require('./src/middlewares/validatorMessage');

const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/src/uploads', express.static(path.join(__dirname + '/src/uploads')))

app.use('/api', routes)
app.use(HandleErrorMessage)
const PORT = process.env.PORT || 2100;
app.get('/', (req, res) => {
    res.status(200).json({status:"Success", message:"Server Started Successfully"})
})
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
