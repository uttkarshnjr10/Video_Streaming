import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    // console.log("toggleSubscription called with channelId:", channelId)
    // console.log("Current User ID:", req.user?._id)

    if (!isValidObjectId(channelId)) {
        // console.log("Invalid channelId:", channelId)
        throw new ApiError(400, "Invalid channel ID")
    }

    const isSubscribed = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId
    })

    // console.log("Existing subscription found:", isSubscribed)

    if (isSubscribed) {
        await Subscription.findByIdAndDelete(isSubscribed._id)

        // console.log("Unsubscribed successfully:", isSubscribed._id)

        return res
            .status(200)
            .json(new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully"))
    } else {
        const newSub = await Subscription.create({
            subscriber: req.user?._id,
            channel: channelId
        })

        // console.log("New subscription created:", newSub)

        return res
            .status(200)
            .json(new ApiResponse(200, { subscribed: true }, "Subscribed successfully"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    // console.log("getUserChannelSubscribers called with channelId:", channelId)

    if (!isValidObjectId(channelId)) {
        // console.log("Invalid channelId:", channelId)
        throw new ApiError(400, "Invalid channel ID")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                subscriber: {
                    $first: "$subscriber"
                }
            }
        }
    ])

    // console.log("Subscribers fetched:", subscribers)

    return res
        .status(200)
        .json(
            new ApiResponse(200, subscribers, "Subscribers fetched successfully")
        )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    // console.log("getSubscribedChannels called with subscriberId:", subscriberId)

    if (!isValidObjectId(subscriberId)) {
        // console.log("Invalid subscriberId:", subscriberId)
        throw new ApiError(400, "Invalid subscriber ID")
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannel",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                subscribedChannel: {
                    $first: "$subscribedChannel"
                }
            }
        }
    ])

    // console.log("Subscribed channels fetched:", subscribedChannels)

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribedChannels,
                "Subscribed channels fetched successfully"
            )
        )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
