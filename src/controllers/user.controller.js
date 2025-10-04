import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

// creating function for the generation of access and refresh tokens
const GenerateAccessAndRefreshToken = async (userId) => {
    try {
        const user = User.findById(user.userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(
    async (req, res, next) => {
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
        const { username, email, fullname, password } = req.body;
        // we can check like this every field single to that if its empty give error  to user that an field is empty but here is a new method to me to check all the fileds in once if one is empty then give value true that any of filed is empty 
        // if (usrname === "") {
        //     throw new ApiError(400,"fullname is required!")
        // }
        // new method of checking
        if ([username, email, fullname, password].some((field) => field?.trim() === "")) {
            throw new ApiError(400, "All Fields Are Required!")
        }
        // checking for existing user : some new code for checking upon multiple fields the username and email if any one is found it give us true 
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        })
        if (existingUser) {
            throw new ApiError(409, "User with username or email alreay exist")
        }
        // handing avatar and images
        const avatarLocalPath = req.files?.avatar[0]?.path;
        // const coverImageLocalPath = req.files?.coverImage[0]?.path;

        let coverImageLocalPath;
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImageLocalPath = req.files.coverImage[0].path
        }

        if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is required !!!")
        }
        const avatar = await uploadOnCloudinary(avatarLocalPath)
        const coverImage = await uploadOnCloudinary(coverImageLocalPath)
        if (!avatar) {
            throw new ApiError(400, "Avatar file is required !!!")
        }

        const user = await User.create({
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase(),
        })
        // checking that user is created successfully
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong when registering user!")
        }
        return res.status(201).json(
            new ApiResponse(200, createdUser, "user registered successfully")
        )
    })


const userLogin = asyncHandler(async (req, res, next) => {
    // todo steps to get user login
    // take fileds from the user which are required to login from req body => email,password
    // get email and password from request body 
    const { email, username, password } = req.body;
    // check for username or email and password that they are filled
    // also we can use this logic as 
    // if(!(email || username)) other things are same
    if (!email && !username) {
        throw new ApiError(400, "email or username is required")
    }
    // find the user in your database
    /**
     * const user = await User.findOne({email})
     */
    // the below one is more advanced technique to find user on the basis of email or username the above is simple approch to find the user on the basis of email
    const user = await User.findOne({
        $or: [{ username, email }]
    })
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    // password check
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "your password is not correct")
    }
    // if password is correct to login generate access and refresh token
    const { accessToken, refreshToken } = await GenerateAccessAndRefreshToken(user._id);
    // send the access and refresh token in cookie

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(200, {
            user: loggedInUser, accessToken, refreshToken
        },
            "User Logged In Successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(req.user.$or,
        {
            $set: {
                refreshToken: undefined
            }
        }, {
        new: true
    }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }
    res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "User Logged Out"))
})

export { registerUser, userLogin, logoutUser }