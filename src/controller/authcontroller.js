import db from "../db/index.js"
import {userTable} from "../models/userModel.js"
import {eq} from "drizzle-orm"
import bcrypt from "bcrypt"
import crypto from "crypto"
import resend from "../utils/resend.js"
import jwt from "jsonwebtoken"
import cookieParser from "cookie-parser"

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
console.log("Error:", error);


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



//email verification
export const verifyemail=async(req,res)=>{
    try {
        const token =req.params.verificationToken;

        const user=await db.select().from(userTable).where(eq(userTable.emailVerificationToken,token));
        
        if(user.length==0){
            return res.status(400).json({message:"not a valid token"});
        }

        if(new Date()>user[0].emailVerificationExpiry){
            return res.status(401).json({mssg:"session expired"});
        }

//updating the databse 
        await db.update(userTable).set({
            emailVerificationToken:null,
            emailVerificationExpiry:null,
            isEmailVerified:true,
            updatedAt: new Date()
        }).where(eq(userTable.id,user[0].id))

        return res.status(200).json({sucess:true,
            mssg:"email verified",
            name:user[0].name,
            email:user[0].email
        })


    } catch (error) {
        return res.json({mssg:error.message})
    }
}


//login

export const login=async(req,res)=>{
    try {
        const{email,password}=req.body;

        if(!email ||!password){
            return res.status(400).json({messg:"bad request"});

        }

        const user=await db.select().from(userTable).where(eq(userTable.email,email));

        if(user.length==0){
            return res.status(400).json({mssg:"invalid email"});

        }
        
        const is_match=await bcrypt.compare(password,user[0].password);

        if(!is_match){
            return res.status(401).json({mssg:"password invalid "})
        }


        if(user[0].isEmailVerified==false){
            return res.status(403).json({mssg:"email not verrified , verify your email "})
        }



        //access token

        const accesstoken =jwt.sign({id:user[0].id,role:user[0].role},process.env.JWT_SECRET,{expiresIn:"1d"});

        //refesh token 

        const refreshtoken=jwt.sign({id:user[0].id,role:user[0].role},process.env.JWT_SECRET,{expiresIn:"7d"});


        //update db

        await db.update(userTable).set({
            refreshToken:refreshtoken,
            updatedAt:new Date()
        }
    
        ).where(eq(userTable.id,user[0].id));


        //storing in cookie 
        res.cookie("refeshtoken",refreshtoken,
            {

                httpOnly: true,

                secure: false,

                

                maxAge: 7 * 24 * 60 * 60 * 1000

            }
        )



        res.cookie("accesstoken",accesstoken,
            {

                httpOnly: true,

                secure: false,

                

                maxAge: 1* 24 * 60 * 60 * 1000

            }
        )




            return res.status(200).json({

            success: true,

            message: "Login successful.",

            

            user: {

                id: user[0].id,

                name: user[0].name,

                email: user[0].email,

                username: user[0].username,

                role: user[0].role
            }
        
    })

        } catch (error) {
        return res.status(500).json({
        success: false,
            message: error.message})
    }
}






//curreent user

export const currentuser=async(req,res)=>{
   try {
    const id=req.user.id;
    const user=await db.select().from(userTable).where(eq(userTable.id,id));
    if(user.length==0){
        return res.status(404).json({message:"uuser cannot be found"})
    }

    return res.status(200).json({mssg:"success",
        id:user[0].id,
       user:{ username:user[0].username,
        email:user[0].email

    }
    })




   } catch (error) {
    return res.status(500).json({mssg:error.message})
   }
}





export const refreshToken=async(req,res)=>{
    try {
        const refreshtoken =req.cookies.refeshtoken;
        

        if(!refreshtoken){
            return res.status(404).json({mssg:"this is the mssg"});
        }


        const decode=jwt.verify(refreshtoken,process.env.JWT_SECRET);

        const user=await db.select().from(userTable).where(eq(userTable.id,decode.id));

        if(user.length==0){
            return res.status(404).json({mssg:"user cannnot be found"});
        }


        if (user[0].refreshToken !== refreshtoken) {
    return res.status(401).json({
        message: "Invalid refresh token"
    });
}

        const accessToken =jwt.sign({id:user[0].id,role:user[0].role},process.env.JWT_SECRET,{expiresIn:"1d"});
        res.cookie("accesstoken",accessToken,
            {

                httpOnly: true,

                secure: false,

                

                maxAge: 1* 24 * 60 * 60 * 1000

            }
        )


        res.status(200).json({mssg:"accees token generATED"})



    } catch (error) {
        return res.status(500).json({mssg:error.message})
    }
}





//logout
export const logout = async (req, res) => {
    try {

        const userId = req.user.id;

        await db
            .update(userTable)
            .set({
                refreshToken: null,
                updatedAt: new Date()
            })
            .where(eq(userTable.id, userId));

        res.clearCookie("accesstoken", {
            httpOnly: true,
            secure: false,
        });

        res.clearCookie("refeshtoken", {
            httpOnly: true,
            secure: false,
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};