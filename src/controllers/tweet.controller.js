import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body

    // console.log("createTweet called with content:", content)
    // console.log("User ID:", req.user?._id)

    if (!content) {
        // console.log("No content provided in request body")
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    })

    // console.log("Tweet created:", tweet)

    if (!tweet) {
        throw new ApiError(500, "Something went wrong while creating the tweet")
    }

    return res.status(201).json(
        new ApiResponse(201, tweet, "Tweet created successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params

    // console.log("getUserTweets called with userId:", userId)

    if (!isValidObjectId(userId)) {
        // console.log("Invalid userId:", userId)
        throw new ApiError(400, "Invalid user ID")
    }

    const tweets = await Tweet.find({ owner: userId })

    // console.log("Tweets fetched:", tweets)

    return res.status(200).json(
        new ApiResponse(200, tweets, "Tweets fetched successfully")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body

    // console.log("updateTweet called with tweetId:", tweetId, "and content:", content)

    if (!isValidObjectId(tweetId)) {
        // console.log("Invalid tweetId:", tweetId)
        throw new ApiError(400, "Invalid tweet ID")
    }

    if (!content) {
        // console.log("No content provided in update")
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.findById(tweetId)

    // console.log("Tweet found:", tweet)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        // console.log("Unauthorized update attempt. Tweet owner:", tweet.owner, "Request user:", req.user._id)
        throw new ApiError(403, "You are not authorized to update this tweet")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        },
        { new: true }
    )

    // console.log("Updated tweet:", updatedTweet)

    if (!updatedTweet) {
        throw new ApiError(500, "Something went wrong while updating the tweet")
    }

    return res.status(200).json(
        new ApiResponse(200, updatedTweet, "Tweet updated successfully")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    // console.log("deleteTweet called with tweetId:", tweetId)

    if (!isValidObjectId(tweetId)) {
        // console.log("Invalid tweetId:", tweetId)
        throw new ApiError(400, "Invalid tweet ID")
    }

    const tweet = await Tweet.findById(tweetId)

    // console.log("Tweet to delete:", tweet)

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    if (tweet.owner.toString() !== req.user._id.toString()) {
        // console.log("Unauthorized delete attempt. Tweet owner:", tweet.owner, "Request user:", req.user._id)
        throw new ApiError(403, "You are not authorized to delete this tweet")
    }

    await Tweet.findByIdAndDelete(tweetId)

    // console.log("Tweet deleted successfully:", tweetId)

    return res.status(200).json(
        new ApiResponse(200, {}, "Tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
