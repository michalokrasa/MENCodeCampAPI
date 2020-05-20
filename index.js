const express = require('express');
const mongoose = require('mongoose');
require('dotenv/config');

const app = express();
app.use(express.urlencoded({ extended: true }));

mongoose.connect(
    process.env.MONGO_URL, 
    { 
        useUnifiedTopology: true, 
        useNewUrlParser: true 
    })
    .then(() => console.log('DB connected'))
    .catch(err => {
        console.log('Error on DB connection: ');
        console.log(err);
    });

const exerciseRoutes = require('./routes/exercises');
app.use('/api/exercise', exerciseRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});