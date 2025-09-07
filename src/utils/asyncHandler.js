// these are utility functions to support the other functions and reduces code duplicasi
const asyncHandler = (requestHandler) => {
    (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err));
    }
}
export {asyncHandler}
// (err)=>next(err) short form of arrow function 
// simple arrow function
// const asyncHandler = () =>{}
// gernal form 
// const asyncHandler = (fn) =>{()=>{}}
    // simplified form

// to use handler functions the purpose is that every where in our backend we must use try catch for safe side to see the output if it's not giving output then we should see the error to understand and resolve . for the duplication of code we use the handler function and just call the handler function and just pass our function as parameter 
// the below code is same as above do but two different methods the below one is try catch and the above one is promises 
/*
const asyncHandler = (fn) =>async(req,res,next)=>{
    try {
        await fn(req,res,next)
    } catch (error) {
        res.status(error.code || 500).json({
            success:false,
            message: error.message,
        })
    }
}
*/


// higher order functions: when a function takes a function as parameter.