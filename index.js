require('dotenv').config();
const express = require('express')
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId,  } = require('mongodb');

// middleware
app.use(cors({
  origin: ['http://localhost:5173',
    'http://localhost:5174',
    'https://strong-fitness-21629.firebaseapp.com',
    'https://strong-fitness-21629.web.app'
  ],
  credentials: true
}));
app.use(express.json());


const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@mdsakib.2yeia.mongodb.net/?retryWrites=true&w=majority&appName=MdSakib`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    
const usersCollection = client.db("TaskDB").collection("users");
const tasksCollection = client.db("TaskDB").collection("Tasks");

app.post('/users', async(req, res) => {
      const user = req.body;
      
      const query = { email: user.email }
      const existingUser = await usersCollection.findOne(query)
      if (existingUser) {
      return res.send({message: 'user already exists', insertedId: null})
    }

      const result = await usersCollection.insertOne(user)
      res.send(result);
    })

app.post("/Tasks", async (req, res) => {
  const { title, description, category, userId } = req.body;
  if (!title || !category) return res.status(400).json({ error: "Title and category are required" });

  const task = {
    title,
    description: description || "",
    category,
    timestamp: new Date(),
    userId
  };

  const result = await tasksCollection.insertOne(task);
  res.status(201).json({ message: "Task added", taskId: result.insertedId });
});

app.get("/Tasks/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const tasks = await tasksCollection.find({ userId }).sort({ position: 1 }).toArray();
    res.send(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

  
// ✅ Update a task (title, description, category)
app.put("/Tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    await tasksCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedData });
    res.send({ message: "Task updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

// 🔹 **DELETE TASK** (DELETE /tasks/:id)
    app.delete("/Tasks/:id", async (req, res) => {
  
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await tasksCollection.deleteOne(query);
      res.send(result)
  
});

   
app.put("/Tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, category } = req.body;

  try {
    const result = await tasksCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { title, description, category } }
    );

    if (result.modifiedCount > 0) {
      res.send({ success: true, message: "Task updated successfully" });
    } else {
      res.status(404).json({ success: false, message: "Task not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
});
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("sakib runing");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);







app.get('/', (req, res) => {
  res.send('asasasasas World!')
})

app.listen(port, () => {
  console.log(`server in the Runing ${port}`)
})