const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;

// middle ware 
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bntbg.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
	try {
		await client.connect();

		// console.log('database connected ');

		const partCollection = client.db('computer-parts').collection('parts');
		const orderCollection = client.db('computer-parts').collection('orders');
		const reviewCollection = client.db('computer-parts').collection('review');
		const userCollection = client.db('computer-parts').collection('user');

		app.get('/part', async (req, res) => {
			const query = {};
			const cursor = partCollection.find(query);
			const parts = await cursor.toArray();
			res.send(parts);
		})

		app.get('/part/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await partCollection.findOne(query);
			res.send(result);
		});

		app.post('/order', async (req, res) => {
			const order = req.body;
			const result = await orderCollection.insertOne(order);
			res.send(result);
		})

		app.get('/order', async (req, res) => {
			const buyer = req.query.buyer;
			
			const query = { buyer: buyer };
		
			const orders = await orderCollection.find(query).toArray();

			res.send(orders);
		})

		app.post('/review', async (req, res) => {
			const review = req.body;
			const result = await reviewCollection.insertOne(review);
			res.send(result);
		})

		app.get('/review', async (req, res) => {
			const query = {};
			const cursor = reviewCollection.find(query);
			const reviews = await cursor.toArray();
			res.send(reviews);
		})

		app.put('/user/:email', async (req, res) => {
			const email = req.params.email;
			const user = req.body;
			const filter = { email: email };
			const options = { upsert: true };
			const updateDoc = {
			  $set: user,
			};
			const result = await userCollection.updateOne(filter, updateDoc, options);
			// const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
			res.send({ result});
		  })

	}
	finally {

	}
}

run().catch(console.dir);


app.get('/', (req, res) => {
	res.send(' computer parts  ');
})

app.listen(port, () => {
	console.log(` computer parts   ${port}`);
})