import dotenv from 'dotenv';
import connectDB from "./db/database.js";
import { app } from './app.js';
dotenv.config({
    path:'../.env'
})
connectDB()
.then(
()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`we are listening at ${process.env.PORT || 8000}`)
    })
}
).catch((err)=>{
    console.log("MongoDb connection failed error: ",err)
})
















/*
import express from 'express'
const app = express()
;(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        // the app.on use in professional codes to check that when the database goes to conncet but due to some issues the express is not responding 
        app.on("error",(error)=>{
            console.log(error)
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`app is listening on port ${process.env.PORT}`)
        })
    } catch (error) {
        console.error("Error : ",error)
        throw error
    }
})() 
    */
