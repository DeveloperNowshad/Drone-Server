const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;



// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.srriw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run(){
    try{
        await client.connect();
        const database = client.db('droneShop');
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        const reviewsCollection = database.collection('reviews');
        const usersCollection = database.collection('users');
        const adminsCollection = database.collection('admins');

        //GET API
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        } )    
        
        //ADD Product
        app.post("/products", async(req,res) =>{
            const result = await productsCollection.insertOne(req.body);
            console.log(result)
        })
      

        //Get Single Product
        app.get("/singleproduct/:id", async(req, res) =>{
            const result = await productsCollection
            .find({_id: ObjectId(req.params.id)})
            .toArray();
            res.send(result[0])
        } )

        //Post Order
        app.post("/confirmOrder", async(req,res) =>{
            const result = await ordersCollection.insertOne(req.body);
            res.send(result)
        })
        //Get Order
        app.get('/confirmOrder', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        } )  

        //User Order
        app.get("/myorder/:email", async (req, res) =>{
            const result = await ordersCollection
            .find({ email: req.params.email })
            .toArray();
            res.send(result);
        })

        //Delete Order
        
        app.delete("/cancelorder/:id", async (req, res)=>{
            const result = await ordersCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        })
        //delete product
        app.delete("/products/:id", async (req, res)=>{
            const result = await productsCollection.deleteOne({
                _id: ObjectId(req.params.id),
            });
            res.send(result);
        })
         //Post Review
        app.post("/reviews", async(req,res) =>{
            const result = await reviewsCollection.insertOne(req.body);
            res.send(result)
        })
        //  Get Review
          app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        } ) 
        //Get Admin
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })


        //  Post user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });
        //  Post user admin
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            console.log(result);
            res.json(result);
        });
        app.put('/status/:id', async (req, res) => {
            const filter = { _id: ObjectId(req.params.id) };
            console.log(req.params.id);
            const result = await ordersCollection.updateOne(filter, {
              $set: {
                status: req.body.status,
              },
            });
            // res.send(result);
            console.log(result);
        });


        console.log('connected database')

    }
    finally{
        //await client.close();
    }

}

run().catch(console.dir)

app.get('/', (req, res)  =>{
    res.send('ruuning')
})

app.listen(port, ()=>{
    console.log('running', port)
}) 