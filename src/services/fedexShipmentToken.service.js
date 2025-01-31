import axios from "axios";
import { ApiError } from "../utils/apiError.js"

const getFedexTokenForShipment = async () => {
    try {
        const response = await axios.post(`${process.env.FEDEX_SHIPMENT_TESTING_URL}/oauth/token`, {
            grant_type: "client_credentials",
            client_id: FEDEX_API_KEY_FOR_SHIPMENT,
            client_secret: FEDEX_API_KEY_SECRET_FOR_SHIPMENT
        })
        return response.data.access_token;
    } catch (error) {
        console.error("Error while creating access token for shipment", error);
        throw new ApiError(400, "Failed to generate access token for shipment")
    }
}

const getFedexTokenForTracking = async () => {
    try {
        const response = await axios.post(`${process.env.FEDEX_SHIPMENT_TESTING_URL}/oauth/token`, {
            grant_type: "client_credentials",
            client_id: FEDEX_API_KEY_FOR_TRACKING,
            client_secret: FEDEX_API_KEY_SECRET_FOR_TRACKING
        })
        return response.data.access_token;
    } catch (error) {
        console.error("Error while creating access token for Tracking", error);
        throw new ApiError(400, "Failed to generate access token for Tracking")
    }
}

export {
    getFedexTokenForShipment,
    getFedexTokenForTracking
}