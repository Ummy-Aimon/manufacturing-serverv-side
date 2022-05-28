const express =require ('express');
const cors =require ('cors');
// jwt token
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port= process.env.PORT || 5000
const app= express()
const { MongoClient, ServerApiVersion,ObjectId } = require('mongodb');
const res = require('express/lib/response');

// payment stripe

const stripe = require("stripe")(process.env.STRIPT_KEY)



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
console.log(authHeader)
if(!authHeader){
    return res.status(401).send({message: "unAuthorized Access"})
}

const token= authHeader.split(' ')[1]
console.log(token)
  jwt.verify(token,process.env.JWT_TOKEN, function(err, decoded){
      if(err){
          console.log(err)
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
        const PaintPurchaseCollection= client.db('PaintBlush').collection('Order')
        const PaintOrderCollection= client.db('PaintBlush').collection('Purchase')
        const PaymentCollection= client.db('PaintBlush').collection('Payment')
        const PaintReviewCollection= client.db('PaintReview').collection('Reviews')
        const UserCollection= client.db('PaintReview').collection('User')
        const ProfileCollection= client.db('PaintReview').collection('Profile')




    // verfy Admin

    // const verifyAdmin = async (req, res, next) => {
    //     const requst= req.decoded.email
    //     const requestAccount= await UserCollection.findOne({ email: requst})
    //     if (requestAccount.role === 'admin'){
    //         next()
    //     }
    //     else{
    //         return  res.status(403).send({message:"Forbidded Access"}) 
    //       }

    // }
       
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

        /// PaintBlush reviews get 

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
    
        app.get('/user',async(req, res)=>{
            const users= await UserCollection.find().toArray()
            res.send(users)

        })

        // PainBlush admin get

        app.get('/admin/:email', async (req,res)=>{
            const email= req.params.email
            const user= await UserCollection.findOne({email:email})
            console.log(user)
            const isAdmin = user.role === 'admin'
            console.log(isAdmin)

            res.send({admin:isAdmin})
        })

        // PaintBlush Admin Put
        app.put('/user/admin/:email' ,verifyJWT, async (req,res)=>{
            const email=req.params.email
            const requst= req.decoded.email
            const requestAccount= await UserCollection.findOne({ email: requst})
           let updateDoc= {}
            if(requestAccount.role === 'admin'){
                const filter= { email:email}
                 updateDoc={
                    $set: {role:'admin'}
                    
            }
            console.log(updateDoc)
            const result= await UserCollection.updateOne
          (filter, updateDoc )
          res.send(result)  
         }
         else{
           return  res.status(403).send({message:"Forbidded Access"}) 
         }
        
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


        // PaintBlush purchase order Tools
        
        app.post('/purchase', async (req,res)=>{
            const newpurchase=req.body
            const orderresult= await PaintPurchaseCollection.insertOne(newpurchase)
            res.send(orderresult)
        })

        app.get('/purchase', async (req,res)=>{
            const email= req.query.email
            console.log(email)
            const query={email:email}
            const cursor= PaintPurchaseCollection.find(query)
            const purchaseItem= await cursor.toArray()
            res.send(purchaseItem)
        })

        // purchase delete 

        app.delete('/purchase/:id', async(req,res)=>{
            const id= req.params.id
            const query={_id:ObjectId(id)}
            const deleteItem= await PaintPurchaseCollection.deleteOne(query)
            res.send(deleteItem)
        })

    // Purchase admin

        app.get('/purchaseadmin', async (req,res)=>{
            const query={}
            const cursor= PaintPurchaseCollection.find(query)
            const purchaseItem= await cursor.toArray()
            res.send(purchaseItem)
        })
        
        //  purchase params

        app.get('/purchase/:id', async(req,res)=>{
            const id= req.params.id
            const query={_id:ObjectId(id)}
            const purchaseItem =await PaintPurchaseCollection.findOne(query)
            res.send(purchaseItem)

        })

        // ALL order purchase 
       
        app.post('/order',  async (req,res)=>{
            const newpurchase=req.body
            const orderresult= await PaintOrderCollection.insertOne(newpurchase)
            res.send(orderresult)
        })

        // all order purchase

        app.get('/order',async(req, res)=>{
            const order= await PaintOrderCollection.find().toArray()
            res.send(order)

        })

        // order delete
        app.delete('/tools/:id', async(req,res)=>{
            const id= req.params.id
            const query={_id:ObjectId(id)}
            const deleteItem= await PaintBlushCollection.deleteOne(query)
            res.send(deleteItem)
        })

        // profile post
        app.post('/profile', async (req,res)=>{
            const newprofile= req.body
            const profileresult= await ProfileCollection.insertOne(newprofile)
            res.send(profileresult)
        })

        app.get('/profile', async (req,res)=>{
            const email= req.query.email
            console.log(email)
            const query={email:email}
            const cursor=  ProfileCollection.find(query)
            const orderItem= await cursor.toArray()
            console.log(orderItem)
            res.send(orderItem)
        })


        /// payment stripe 

        app.post("/create-payment-intent", async (req, res) => {
            const { price } = req.body;

            // Create a PaymentIntent with the order amount and currency
            const paymentIntent = await stripe.paymentIntents.create({
              amount: price*100,
              currency: "usd",
              payment_method_types: ["card"]
            });
          
            res.send({
              clientSecret: paymentIntent.client_secret,
            });
          });
    
        //   payment patch

        app.patch('/purchase/:id', async(req,res)=>{
            const id= req.params.id
            const payment= req.body
            const query={_id:ObjectId(id)}
            const updateDoc={
                $set:{
                    paid:true,
                    transaction: payment.transaction

            }
        }
            const updatedPurchase= await PaintPurchaseCollection.updateOne (query,updateDoc)
            const result= await PaymentCollection.insertOne(payment)
            res.send(updateDoc)

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