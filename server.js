const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');
const cors = require('cors');

//server setup
const app = express();

//middlewares
require('dotenv').config();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public'));
app.set('view engine', 'ejs');

//database setup
const client = new pg.Client(process.env.DATABASE_URL);

// const client = new pg.Client({
// 	connectionString: process.env.DATABASE_URL,
// 	ssl: { rejectUnauthorized: false },
// });



// function errorHandler(err,req,res){
//     res.status(500).send(err);
// }

// function notFoundHandler(req,res){
//     res.status(404).send('NOT FOUND!')
// }

const PORT = process.env.PORT || 3030;

// client.connect().then(() => {
	app.listen(PORT, () => {
		console.log(`listening on PORT ${PORT}`);
// 	});
});
