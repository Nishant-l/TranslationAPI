const express = require('express');
const db = require('./config/mongoose');
const port = 8000;

const app = express();

app.use('/',require('./routes/api/v1/index'));

app.listen(port, (err) => {
    if(err){
        console.log(err);
        return;
    }
    console.log(`Server Up and Running on port ${port}`);
})