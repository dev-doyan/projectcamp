import db from "../db/index.js"
import {userTable} from "../models/userModel.js"
import {eq} from "drizzle-orm"
import bcrypt from "bcrypt"
import crypto from "crypto"
import resend from "../utils/resend.js"
import { enableCompileCache } from "module"

export const register=async(req,res)=>{
    try {
        const {name,email,username,password}=req.body;

    if(!name || !email || !username || !password){
        return res.status(400).json({message:"bad req"})
    }

    const matchemail= await db.select({email:userTable.email}).from(userTable).where(eq(userTable.email,email));
    if(matchemail.length>0){
        return res.status(409).json({message:"user already exists with this email"})
    }


    const e_username =await db.select({username:userTable.username}).from(userTable).where(eq(userTable.username ,username));

if(e_username.length>0){
    return res.status(409).json({message:"user already exists with this  username "})
}



    const hashedpas=await bcrypt.hash(password,10);


   //generating email verificationn token
   
   const email_vt= crypto.randomBytes(32).toString("hex");

   //email verification token expiry

   const v_expiry=new Date(
    Date.now() + 24*60*60*1000
)

//insert user
const user=await db.insert(userTable).values({
    name,
    email,
    username,
    password: hashedpas,
    emailVerificationToken: email_vt,
    emailVerificationExpiry:v_expiry
}).returning({
    id:userTable.id,
    email:userTable.email,
    username:userTable.username

})

//creating email verification link 

const e_verificationnLink= `${process.env.BASE_URL}/api/v1/auth/verify-email/${email_vt}`;


//sendinf email using resend  

const { data, error } = await resend.emails.send({
    from: "projectcamp<onboarding@resend.dev>",
    to: email,
    subject: "Verify your Project Camp Account",
    html: `<h1><h2>click below to verify email</h2>
<a href="${e_verificationnLink}">verify email</a>

<p>
    This link expires in 24 hours.
</p></h1>`
});

if (error) {
    console.error("Resend error:", error);
    // don't fail user creation, but log/flag it — or return 500 if email delivery is critical
}

console.log("Resend success:", data);


        return res.status(201).json({
            success: true,
            message:
                "User registered successfully. Please verify your email.",
            user,
        });





    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}