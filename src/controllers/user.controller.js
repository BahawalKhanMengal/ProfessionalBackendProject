import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req,res,next) => {
    // steps to register user 
    // get user deatils from frontend
    // validation all posible validation 
    // check if user already exist : username , email
    // check for images : check for avatar
    // upload them to cloudinary, avatar
    // create user object  -- create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    const {username,email,fullname,password} = req.body;
    // we can check like this every field single to that if its empty give error  to user that an field is empty but here is a new method to me to check all the fileds in once if one is empty then give value true that any of filed is empty 
    // if (usrname === "") {
    //     throw new ApiError(400,"fullname is required!")
    // }
    // new method of checking
    if ([username,email,fullname,password].some((field)=>field?.trim()==="") ){
        throw new ApiError(400,"All Fields Are Required!")
    }
    // checking for existing user : some new code for checking upon multiple fields the username and email if any one is found it give us true 
    const existingUser = User.findOne({
        $or:[{username},{email}]
    })
    if(existingUser){
        throw new ApiError(409,"User with username or email alreay exist")
    }
    // handing avatar and images
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required !!!")
    }
    const avatar =  await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400,"Avatar file is required !!!")
    }

    const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    })
// checking that user is created successfully
    const createdUser =await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"Something went wrong when registering user!")
    }
    return res.status(201).json(
        new ApiResponse(200,createdUser,"user registered successfully")
    )
})

export {registerUser}