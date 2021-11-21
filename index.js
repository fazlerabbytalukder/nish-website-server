const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;



//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cnnr8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log(uri);

async function run() {
    try {
        await client.connect();
        // console.log('database connect successfully');
        const database = client.db("NishWebsite");
        const productCollection = database.collection("products");
        const reviewCollection = database.collection("reviews");
        const usersCollection = database.collection("users");
        const ordersCollection = database.collection("orders");

        //PRODUCTS DATA SHOW
        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        })
        //POST PRODUCTS DATA
        app.post('/products', async (req, res) => {
            const products = req.body;
            const result = await productCollection.insertOne(products);
            res.json(result)
        })
        //GET API With id
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await productCollection.findOne(query);
            res.json(service);
        })

        //DELETE products
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id:ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.json(result);
        })



        //POST ORDER DATA
        app.post('/orders', async (req, res) => {
            const booking = req.body;
            const result = await ordersCollection.insertOne(booking);
            // console.log(result);
            res.json(result)
        })






        //UPDATE ORDER DATA
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updateOrder = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upset: true };
            const updateDoc = {
                $set: {
                    status: "Shipped"
                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc, options);
            res.json(result)
        })





        

        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = ordersCollection.find(query);
            const bookings = await cursor.toArray();
            res.json(bookings);
        });

        app.get('/allOrders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const bookings = await cursor.toArray();
            res.json(bookings);
        });









        //DELETE order
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id:ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })

        //GET ORDER SPECIFIC USER DATA
        // app.get('/orders', async (req, res) => {
        //     const email = req.query.email;
        //     const query = { email: email }
        //     const cursor = ordersCollection.find(query);       
        //     const orders = await cursor.toArray();
        //     res.json(email);
        // })
        //POST REVIEW DATA
        app.post('/reviews', async (req, res) => {
            const reviews = req.body;
            console.log(reviews);
            const result = await reviewCollection.insertOne(reviews);
            // console.log(result);
            res.json(result)
        })
        //REVIEW DATA SHOW
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })
        //USER INFO POST TO THE DATABASE
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result)
        })
        //USER PUT FOR GOOGLE SIGN IN METHOD(upsert)
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        })
        //MAKE ADMIN OR NORMAL USERS
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            // console.log(user);
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })
        //DIFFERENTIATE ADMIN CAN ONLY ADD ADMIN
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user) {
                if (user.role === 'admin') {
                    isAdmin = true;
                }
                res.json({ admin: isAdmin });
            }
            else {
                res.json({ admin: isAdmin });
            }
            // res.json('dd');
        })


    } finally {
        // await client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('run from ovilashi server');
})

app.listen(port, () => {
    console.log('running server on port', port);
})