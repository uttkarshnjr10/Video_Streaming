import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    //simply returns the OK status as json with a message
    return res.status(200).json(new ApiResponse(200, {message: "Everything is O.K"}, "Health check successful"));
})

export {
    healthcheck
    }
    