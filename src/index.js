import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import initializeDb from './db';
import middleware from './middleware';
import api from './api';
import config from './config.json';
import mysql from 'mysql';
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'orders'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected!');
});


let app = express();
app.server = http.createServer(app);
app.use(function(req,res,next){
    req.db = connection; //this db comes from app.js context where you define it
    next();
});
// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}));

app.use(bodyParser.json({
	limit : config.bodyLimit
}));

// connect to db
// initializeDb( db => {
// 	console.log(db);
// 	// internal middleware
// 	app.use(middleware({ config, db }));

// 	// api router
// 	

// 	app.server.listen(process.env.PORT || config.port, () => {
// 		console.log(`Started on port ${app.server.address().port}`);
// 	});
// });
app.use('/api', api({ config, connection }));
app.server.listen(process.env.PORT || config.port, () => {
			console.log(`Started on port ${app.server.address().port}`);
		});
export default app;
