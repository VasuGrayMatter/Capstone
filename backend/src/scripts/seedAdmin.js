import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

async function seedAdmin(){
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("connected to Mongodb");
        const adminEmail="admin@example.com";

        const existingAdmin=await User.findOne({email:adminEmail});
        if(existingAdmin){
            console.log("admin already exists");
            process.exist(0);
        }

        const admin=new User({
            name:"Admin",
            email:"adminEmail",
            password:"admin123",
            role:"admin",
        });

        await admin.save();
        console.log("admin User Created:",admin.email);
        process.exit(0);
    }
    catch(err){
        console.log("error seeding admin",err);
        process.exist(0);
    }
}
seedAdmin();