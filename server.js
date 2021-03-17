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

//routes
app.get('/',homeHandler);
app.get('/getCountryResult',getCountryResultHandler);
app.get('/allCountries',allCountriesHandler);
app.post('/myRecords',myRecordsHandler);
app.get('/myRecords',myRecordsHandler2);
app.get('/details/:id',detailsHandler);
app.delete('/delete/:id',deleteHandler);

//handlers


// World Total Statistics for COVID-19 

function homeHandler(req,res){
	let url ='https://api.covid19api.com/world/total';
	superagent.get(url)
	.then((data)=>{
		res.render('pages/home',{data:data.body});
	}).catch(()=>{
		errorHandler('error')
	})
}

//Covid-19 statistics for a specific country during a specific period of time

function getCountryResultHandler(req,res){
	let{country,from,to}=req.query;
	let url=`https://api.covid19api.com/country/${country}/status/confirmed?from=${from}T00:00:00Z&to=${to}T00:00:00Z`;
	superagent.get(url)
	.then((data)=>{
		let countryData= data.body.map((item)=>{
			return new Country(item)
		})
		res.render('pages/getCountryResult',{data:countryData});
	}).catch(()=>{
		errorHandler('error')
	})
}

//COVID-19 statistics for all the countries in the world
function allCountriesHandler(req,res){
	let url='https://api.covid19api.com/summary';
	superagent.get(url)
	.then((data)=>{
		let countryData = data.body.Countries.map((item)=>{
			return new AllCountries(item);
		})
		res.render('pages/allCountries',{data:countryData})
	}).catch(()=>{
		errorHandler('error')
	})
}

//add specific country and its details to database
function myRecordsHandler(req,res){
	let {country,totalconfirmed,totaldeaths,totalrecovered,date}=req.body;
	let sql='INSERT INTO countries (country,totalconfirmed,totaldeaths,totalrecovered,date) VALUES ($1,$2,$3,$4,$5);';
	let values=[country,totalconfirmed,totaldeaths,totalrecovered,date];
	client.query(sql,values)
	.then((results)=>{
		res.redirect('/myRecords')
	}).catch(()=>{
		errorHandler('error')
	})
}

//display all countries in database
function myRecordsHandler2(req,res){
	let sql='SELECT * FROM countries;';
	client.query(sql)
	.then((results)=>{
		res.render('pages/myRecords',{data:results.rows})
	}).catch(()=>{
		errorHandler('error')
	})
}

//view details for specific country
function detailsHandler(req,res){
	let id=req.params.id;
	let sql='SELECT * FROM countries WHERE id=$1;';
	let value=[id];
	client.query(sql,value)
	.then((results)=>{
		res.render('pages/details',{data:results.rows[0]})
	}).catch(()=>{
		errorHandler('cant show details ')
	})
}

//delete specific country from database
function deleteHandler(req,res){
	let id=req.params.id;
	let sql='DELETE FROM countries WHERE id=$1;'
	let value=[id];
	client.query(sql,value)
	.then((results)=>{
		res.redirect('/myRecords')
	}).catch(()=>{
		errorHandler('error')
	})
}

// constructors

function Country(data){
	this.country=data.Country;
	this.cases=data.Cases;
	this.date=data.Date;
}

function AllCountries(data){
	this.country=data.Country;
	this.totalconfirmed=data.TotalConfirmed;
	this.totaldeaths=data.TotalDeaths;
	this.totalrecovered=data.TotalRecovered;
	this.date=data.Date;
}

//database setup
// const client = new pg.Client(process.env.DATABASE_URL);

//deploy on heroku
const client = new pg.Client({
	connectionString: process.env.DATABASE_URL,
	ssl: { rejectUnauthorized: false },
});



function errorHandler(err,req,res){
    res.status(500).send(err);
}


const PORT = process.env.PORT || 3030;

client.connect().then(() => {
	app.listen(PORT, () => {
		console.log(`listening on PORT ${PORT}`);
	});
});
