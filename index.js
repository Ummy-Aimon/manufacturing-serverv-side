const express =require ('express');
const cors =require ('cors');
require('dotenv').config()
const port= process.env.PORT || 5000
const app= express()
const { MongoClient, ServerApiVersion } = require('mongodb');

// Middelware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.Paint_User}:${process.env.Paint_Pass}@cluster0.0ergu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });






app.get('/',(req,res)=>{
    res.send('Running painblush manufacturing tools')
})
app.listen(port,()=>{
    console.log('Listening on port',port)
})