const express = require('express');
const app =express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(cors({
    // origin: [
       
    //     // 'https://findjob-a2605.web.app',
    //     // 'https://findjob-a2605.firebaseapp.com'
    
    // ], 
     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Authorization', 'Content-Type'],
  }));
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.265tqpu.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    serverSelectionTimeoutMS: 60000, 
  });
  
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    const userCollection = client.db('taskManagementDB').collection('user');
    const taskCollection = client.db('taskManagementDB').collection('task');
   
    app.post('/user', async (req, res) => {
        
        const user = req.body;
        const query = {email:user.email};
        const exitUser = await userCollection.findOne(query);
        if(exitUser){
            return res.send({message:'user already exit',insertedId:null})
        }
        console.log(user);
        const result = await userCollection.insertOne(user);
        res.send(result);
    });
    
    app.post('/dashboard/addTask', async (req, res) => {
        
        const task = req.body;
        console.log(task);
        const result = await taskCollection.insertOne(task);
        res.send(result);
    });
    app.get('/user', async (req, res) => {
    //     console.log('Request Headers:', req.headers);
        const authHeader = req.headers;
        console.log('Authorization Header:', authHeader);
        const cursor = userCollection.find();
        const users = await cursor.toArray();
        res.send(users);
    })
   
        // fOR CLIENT SIDE
        app.get('/task', async (req, res) => {
            const cursor = taskCollection.find();
            const tasks = await cursor.toArray();
            res.send(tasks);
        })
        app.get('/taskDetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await taskCollection.findOne(query);
            res.send(result);
        })
        app.get('/dashboard/task/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await taskCollection.findOne(query);
            res.send(result);
        })
         app.delete('/dashboard/task/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await taskCollection.deleteOne(query);
        res.send(result);
        })
    
    app.put('/dashboard/task/:id', async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) }
        const options = { upsert: true };
        const updateTask = req.body;

        const task = {
            $set: {
                
                 name :updateTask.name,
                 description:updateTask.description,
                 taskDate :updateTask.taskDate,
                priority :updateTask.priority,
                status :updateTask.status,
                
            }
        }

        const result = await taskCollection.updateOne(filter, task, options);
        res.json({ success: true, message: 'Application successful' });
    })

    app.get('/user/email', async (req, res) => {
        const { email } = req.query;

  try {
    const user = await userCollection.findOne({ email });

    if (user) {
      res.json([user]);
    } else {
      res.json([]); // User not found
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
    })

    // Send a ping to confirm a successful connection
   // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('task Management DB')
  })
   
  app.listen(port, () => {
    console.log(`management Port is ${port}`)
  })