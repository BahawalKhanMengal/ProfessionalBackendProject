import mongoose ,{Schema} from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
const userSchema = new Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required: true,
            unique:true,
            localcase:true,
            trim:true
        },
        fullname:{
            type:String,
            required: true,
            trim:true,
            index:true
        },
        avatar:{
            type:String, //cloudinary url
            required:true,
        },
        coverimage:{
            type:String, //cloudinary url
        },
        watchHistory:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:{
            type:String,
            required:[true,"password is required"],
        },
        refreshToken:{
            type:String,
        }

    }
    ,{timestamps:true}
)
// pre is used as like middlewares and it does password hashing in database just before the saving in database 
userSchema.pre("save",async function (next) {
    // here we are checking negativly that if the password is not modified then retrun from if line statement which is written in shortcut without one {} brackets because it ending in one line. if the password is modifed then run line below if statement
    if(!this.isModified("password")) return next()
    this.password =await bcrypt.hash(this.password,10)
    next()
})
// if the bcrypt can do hashing than also it can compare passwords like user just register once and the password is hashed than how user knows the hashed password user just write password than the whole work done by bcrypt to compare user write password and hashed password to return true or false 

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
    // the above line compare the user written password : password and the saved password in database:this.password for validation to give true or false
}
// access token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
        _id : this._id,
        email : this.email,
        username:this.username,
        fullname : this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
)
}
// refresh token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
        _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
)
}
export const User = mongoose.model("User",userSchema)

// in the above first import we use the destructuring like Schema if we destructure any keyword of function of mongoose than we can use it without mongoose. like in userSchema line and the other dot concept is also mentioned in export User line