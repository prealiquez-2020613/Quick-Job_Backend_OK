import mongoose, { disconnect } from 'mongoose'

export const connect = async()=>{
    try{
        mongoose.connection.on('error', ()=>{
            console.log('MongoDB | Could not be connect to mongodb')
        })
        mongoose.connection.on('connecting', ()=>{
            console.log('MongoDB | try conecting')
        })
        mongoose.connection.on('connected', ()=>{
            console.log('MongoDB | connected to mongodb')
        })
        mongoose.connection.once('open', ()=>{
            console.log('MongoDB | connected to database')
        })
        mongoose.connection.on('reconnected', ()=>{
            console.log('MongoDB | reconnected to mongodb')
        })
        mongoose.connection.on('disconnected', ()=>{
            console.log('MongoDB | disconnected')
        })

        await mongoose.connect(
            `${process.env.URI_MONGO}`,
            {
                maxPoolSize: 50,
                serverSelectionTimeoutMS: 5000
            }
        )

    }catch(err){
        console.error('Database connection failed', err)
    }
}