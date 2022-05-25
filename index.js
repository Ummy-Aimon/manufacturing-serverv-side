const express =require ('express');
const cors =require ('cors');
// jwt token
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port= process.env.PORT || 5000
const app= express()
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const res = require('express/lib/response');



// Middelware
app.use(cors())
app.use(express.json())

// MongoDB Atlast

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0ergu.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// verify token 

function verifyJWT(req,res,next){
const authHeader = req.headers.authorization

if(!authHeader){
    return res.status(401).send({message: "unAuthorized Access"})
}

const token= authHeader.split('')[1]

  jwt.verify(token,process.env.JWT_TOKEN, function(err, decoded){
      if(err){
          return res.status(403).send({message:"Forbidded Access"})
      }
      req.decoded= decoded
      next()
})


}

async function run (){
    try{
        await client.connect();
        const PaintBlushCollection= client.db('PaintBlush').collection('Tools')
        const PaintReviewCollection= client.db('PaintReview').collection('Reviews')
        const UserCollection= client.db('PaintReview').collection('User')

       
        // PaintBlush tools get
        app.get('/tools', async (req,res) => {
            const query={}
            const cursor= PaintBlushCollection.find(query)
            const PaintBlushItem= await cursor.toArray()
            console.log(PaintBlushItem)
            res.send(PaintBlushItem)
        
            })
            
        //    PaintBlush tools Param

            app.get('/tools/:id', async(req,res)=>{
                const id= req.params.id
                const query={_id:ObjectId(id)}
                const PaintItem =await PaintBlushCollection.findOne(query)
                res.send(PaintItem)
    
            })

        // PaintBlush tools POST
        app.post('/tools', async (req,res)=>{
            const newtool=req.body
            const toolresult= await PaintBlushCollection.insertOne(newtool)
            res.send(toolresult)
        })

        // PaintBlush reviews get 

        app.get('/reviews', async (req,res) => {
            const query={}
            const cursor= PaintReviewCollection.find(query)
            const PaintReviewItem= await cursor.toArray()
            res.send(PaintReviewItem)
        
            })

            // PaintBlush reviews POST

        app.post('/reviews', async (req,res)=>{
            const newreview=req.body
            const reviewresult= await PaintReviewCollection.insertOne(newreview)
            res.send(reviewresult)
        })

        // PainBlush user get
    
        app.get('/user',verifyJWT,async(req, res)=>{
            const users= await UserCollection.find().toArray()
            res.send(users)

        })

        // PainBlush admin get

        app.get('/admin/:email', async (req,res)=>{
            const email= req.params.email
            const user= await UserCollection.findOne({email:email})
            const isAdmin = user.role === 'admin'
            res.send(isAdmin)
        })

        // PaintBlush Admin Put
        app.put('/user/admin/:email' , verifyJWT,async (req,res)=>{
            const email=req.params.email
            const requst= req.decoded.email
            const requestAccount= await UserCollection.findOne({ email: requst})
            if(requestAccount.role === 'admin'){
                const filter= { email:email}
                const updateDoc={
                    $set: {role:"admin"}
                    
            }
            const result= await UserCollection.updateOne
          (filter, updateDoc )
          res.send(result)  
         }
         else{
             res.status(403).send({message:"Forbidded Access"}) 
         }
        //   const token=jwt.sign({email:email}, process.env.JWT_TOKEN,{ expiresIn: '1h' })
        
          })
         
        // PaintBlush user Put
        app.put('/user/:email', async (req,res)=>{
          const email=req.params.email
          const user= req.body
          const filter= { email:email}
          const options={upsert:true}
          const updateDoc={
              $set: user
              
          };
        const result= await UserCollection.updateOne
        (filter, updateDoc,options, )
        const token=jwt.sign({email:email}, process.env.JWT_TOKEN,{ expiresIn: '1h' })
          res.send({result,token})
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