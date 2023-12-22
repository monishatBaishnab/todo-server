const express = require('express');
const cors = require('cors');
const cookie_parser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

// Initialize the Express application
const app = express();
const port = process.env.PORT || 5000;

// Middleware setup
app.use(cors({
    origin: ['http://localhost:5173', 'https://job-task-ac5cd.web.app', 'https://job-task-ac5cd.firebaseapp.com'],
    credentials: true
}));
app.use(express.json());
app.use(cookie_parser());

// MongoDB URI for connecting to the database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.viujuo0.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoDB client instance
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
})

app.get('/', (req, res) => {
    res.send("Server is Running");
})

// Function to interact with MongoDB
const mongodbRun = async () => {
    try {
        // Connect to the MongoDB database
        // await client.connect();
        const tasks = client.db('task-managementt').collection('tasks');

        app.get('/tasks/:userId', async (req, res) => {
            const userId = req.params.userId;
            const status = req.query.status;
            const filterObj = {};

            if (userId) {
                filterObj.userId = userId;
            }

            if (status) {
                filterObj.status = status;
            }

            const result = await tasks.find(filterObj).toArray();
            res.send(result);
        })

        app.post('/tasks', async (req, res) => {
            const task = req.body;

            const result = await tasks.insertOne(task);;
            res.send(result);
        })

        app.put('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const newTask = req.body;

            const updatedTask = {
                $set: {
                    ...newTask
                }
            }

            try {
                const result = await tasks.updateOne({ _id: new ObjectId(id) }, updatedTask);;
                res.send(result);
            } catch (error) {
                console.log(error);
                res.send(error)
            }
        })

        app.delete('/tasks/:id', async (req, res) => {
            const id = req.params.id;

            const result = await tasks.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
        console.log(error);
    }
}





// Execute the MongoDB interaction function
mongodbRun();

// Start the Express server and listen on the defined port
app.listen(port, () => console.log("Server Running..."));
