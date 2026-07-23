import jwt from "jsonwebtoken"



export const authenticate=async(req,res,next)=>{
    
    try {
        const accesstoken=req.cookies.accesstoken;
    if (!accesstoken) {

            return res.status(401).json({
                success: false,
                message: "Access token missing. Please login."
            });
        }


        const decode =jwt.verify(accesstoken,process.env.JWT_SECRET);

// const user = await db
//     .select()
//     .from(userTable)
//     .where(eq(userTable.id, decoded.id));

// if (user.length === 0) {
//     return res.status(401).json({
//         message: "User not found."
//     });
// }

// req.user = user[0];

req.user=decode;
console.log(req.user)
next()


    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired access token."
        });
    }

}