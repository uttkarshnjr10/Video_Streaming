import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


   /*
      1. get video id from params
      2. check if video id is valid
      3. search if this user already liked the video
      4. if yes - remove like and return response
      5. if no - create like and return response
    */

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    // console.log("toggleVideoLike called with videoId:", videoId)
    // console.log("User ID:", req.user?._id)

    if (!isValidObjectId(videoId)) {
        // console.log("Invalid videoId:", videoId)
        throw new ApiError(400, "Invalid video ID")
    }

    const likedAlready = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    })

    // console.log("Already liked video?:", likedAlready)

    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready._id)
        // console.log("Like removed for videoId:", videoId)
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }, "Like removed"))
    }

    const newLike = await Like.create({
        video: videoId,
        likedBy: req.user?._id
    })

    // console.log("New like created for video:", newLike)

    return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: true }, "Like added"))
})

    /*
      1. get comment id from params
      2. check if comment id is valid
      3. search if this user already liked the comment
      4. if yes - remove like and return response
      5. if no - create like and return response
    */
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    // console.log("toggleCommentLike called with commentId:", commentId)
    // console.log("User ID:", req.user?._id)

    if (!isValidObjectId(commentId)) {
        // console.log("Invalid commentId:", commentId)
        throw new ApiError(400, "Invalid comment ID")
    }

    const likedAlready = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
    })

    // console.log("Already liked comment?:", likedAlready)

    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready._id)
        // console.log("Like removed for commentId:", commentId)
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }, "Like removed"))
    }

    const newLike = await Like.create({
        comment: commentId,
        likedBy: req.user?._id
    })

    // console.log("New like created for comment:", newLike)

    return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: true }, "Like added"))
})

  /*
      1. get tweet id from params
      2. check if tweet id is valid
      3. search if this user already liked the tweet
      4. if yes - remove like and return response
      5. if no - create like and return response
    */
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    // console.log("toggleTweetLike called with tweetId:", tweetId)
    // console.log("User ID:", req.user?._id)

    if (!isValidObjectId(tweetId)) {
        // console.log("Invalid tweetId:", tweetId)
        throw new ApiError(400, "Invalid tweet ID")
    }

    const likedAlready = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    // console.log("Already liked tweet?:", likedAlready)

    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready._id)

        // console.log("Like removed for tweetId:", tweetId)
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }, "Like removed"))
    }

    const newLike = await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    // console.log("New like created for tweet:", newLike)

    return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: true }, "Like added"))
})

   /*
      1. find all likes for current user where type is video
      2. lookup video details for each like
      3. inside video lookup -> also fetch owner details
      4. unwind arrays to flatten results
      5. project only needed fields for response
      6. return final list of liked videos with owner info
    */
const getLikedVideos = asyncHandler(async (req, res) => {
    // console.log("getLikedVideos called for userId:", req.user?._id)

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideo",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
                        }
                    },
                    {
                        $unwind: "$ownerDetails"
                    }
                ]
            }
        },
        {
            $unwind: "$likedVideo"
        },
        {
            $project: {
                _id: 0,
                likedVideo: {
                    _id: 1,
                    videoFile: 1,
                    thumbnail: 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    views: 1,
                    owner: {
                        _id: "$ownerDetails._id",
                        username: "$ownerDetails.username",
                        fullName: "$ownerDetails.fullName",
                        avatar: "$ownerDetails.avatar",
                    }
                }
            }
        }
    ])

    // console.log("Liked videos fetched:", likedVideos)

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likedVideos,
                "Liked videos fetched successfully"
            )
        )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
