const express =require ('express');
const cors =require ('cors');
require('dotenv').config()
const port= process.env.PORT || 5000
const app= express()
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');

// Middelware
app.use(cors())
app.use(express.json())

// MongoDB Atlast

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0ergu.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run (){
    try{
        await client.connect();
        const PaintBlushCollection= client.db('PaintBlush').collection('Tools')
       
        // PaintBlush get
        app.get('/tools', async (req,res) => {
            const query={}
            const cursor= PaintBlushCollection.find(query)
            const PaintBlushItem= await cursor.toArray()
            console.log(PaintBlushItem)
            res.send(PaintBlushItem)
        
            })
            
        //    PaintBlush Param

            app.get('/tools/:id', async(req,res)=>{
                const id= req.params.id
                const query={_id:ObjectId(id)}
                const PaintItem =await PaintBlushCollection.findOne(query)
                res.send(PaintItem)
    
            })

        // PaintBlush POST
        app.post('/tools', async (req,res)=>{
            const newtool=req.body
            const toolresult= await PaintBlushCollection.insertOne(newtool)
            res.send(toolresult)
        })
    }
    finally{

    }
}
run().catch(console.dir)

app.get('/',(req,res)=>{
    res.send('Running painblush manufacturing tools')
})
app.listen(port,()=>{
    console.log('Listening on port',port)
})