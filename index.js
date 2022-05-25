const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
// const { MongoClient, ServerApiVersion } = require('mongodb');

const port = process.env.PORT || 5000;

// middle ware 
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
	res.send(' coming from the doctors portals ');
})
app.listen(port, () => {
	console.log(` Doctor Portal Running to this port  ${port}`)
  })