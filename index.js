const express = require('express');
const app = express()
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;

// middle ware 
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bntbg.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
	  return res.status(401).send({ message: 'UnAuthorized access' });
	}
	const token = authHeader.split(' ')[1];
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
	  if (err) {
		return res.status(403).send({ message: 'Forbidden access' })
	  }
	  req.decoded = decoded;
	  next();
	});
  }
  

async function run() {
	try {
		await client.connect();

		// console.log('database connected ');

		const partCollection = client.db('computer-parts').collection('parts');
		const orderCollection = client.db('computer-parts').collection('orders');
		const reviewCollection = client.db('computer-parts').collection('review');
		const profileCollection = client.db('computer-parts').collection('profile');
		const userCollection = client.db('computer-parts').collection('user');

		app.get('/part', async (req, res) => {
			const query = {};
			const cursor = partCollection.find(query);
			const parts = await cursor.toArray();
			res.send(parts);
		})

		// send data to the server 
		app.post('/part', async (req, res) => {

			const newPart = req.body;

			const result = await partCollection.insertOne(newPart);

			res.send(result);

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

		app.get('/order', verifyJWT, async (req, res) => {
			const buyer = req.query.buyer;
			const decodedEmail = req.decoded.email;
			if (buyer === decodedEmail) {
				const query = { buyer: buyer };
				const orders = await orderCollection.find(query).toArray();
			 	return res.send(orders);
			}
			else {
				return res.status(403).send({ message: 'forbidden access' });
			  }
		})

		app.post('/review', async (req, res) => {
			const review = req.body;
			const result = await reviewCollection.insertOne(review);
			res.send(result);
		})
		app.post('/profile', async (req, res) => {
			const profile = req.body;
			const result = await profileCollection.insertOne(profile);
			res.send(result);
		})

		app.get('/review', async (req, res) => {
			const query = {};
			const cursor = reviewCollection.find(query);
			const reviews = await cursor.toArray();
			res.send(reviews);
		})

		app.get('/user', verifyJWT, async (req, res) => {

			const users = await userCollection.find().toArray();
			res.send(users);
			
		})

		app.get('/admin/:email', async(req, res) =>{
			const email = req.params.email;
			const user = await userCollection.findOne({email: email});
			const isAdmin = user.role === 'admin';
			res.send({admin: isAdmin})
		  })

		app.put('/user/admin/:email', verifyJWT, async (req, res) => {
			const email = req.params.email;
			const requester = req.decoded.email;
			const requesterAccount = await userCollection.findOne({ email: requester });
			if (requesterAccount.role === 'admin') {
			  const filter = { email: email };
			  const updateDoc = {
				$set: { role: 'admin' },
			  };
			  const result = await userCollection.updateOne(filter, updateDoc);
			  res.send(result);
			}
			else{
			  res.status(403).send({message: 'forbidden'});
			}
	  
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
		 const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' }) 
			res.send({ result, token});
		  })

	}
	finally {

	}
}

run().catch(console.dir);


app.get('/', (req, res) => {
	res.send(' computer parts');
})

app.listen(port, () => {
	console.log(` computer parts   ${port}`);
})