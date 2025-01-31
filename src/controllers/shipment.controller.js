import { ApiError } from "../utils/apiError.js";
import axios from "axios";
import mongoose from "mongoose";
import { Address } from "../models/address.model.js";
import { getFedexTokenForShipment, getFedexTokenForTracking } from "../services/fedexShipmentToken.service.js";

const createShipment = async (addressId) => {
    try {
        if (!addressId) {
            throw new ApiError(400, "Address Id is required")
        }
        if (!mongoose.isValidObjectId(addressId)) {
            throw new ApiError(400, "Mongooose id is invalid")
        }
        const address = await Address.findById(addressId);
        if (!address) {
            throw new ApiError(404, "Address with the given id not found")
        }
        const accessToken = await getFedexTokenForShipment();

        if (!accessToken) {
            throw new ApiError(400, "Unable to get access token from fedex")
        }
        const shipmentData = {
            accountNumber: {
                value: FEDEX_ACCOUNT_NUMBER_FOR_SHIPMET, // Get this from FedEx Developer Portal
            },
            requestedShipment: {
                shipper: {
                    contact: {
                        personName: "Sahil Rana",
                        phoneNumber: "1234567890",
                        companyName: "Sports",
                    },
                    address: {
                        streetLines: ["Rzf-2/123"],
                        city: "Palam,New Delhi",
                        postalCode: "110045",
                        countryCode: "IN",
                    },
                },
                recipient: {
                    contact: {
                        personName: address.owner,
                        phoneNumber: address.mobileNumber,
                        companyName: "HOME",
                    },
                    address: {
                        streetLines: address.houseNumber,
                        city: address.city,
                        postalCode: address.pincode,
                        countryCode: "IN",
                    },
                },
                shippingChargesPayment: {
                    paymentType: "SENDER",
                    payor: {
                        responsibleParty: {
                            accountNumber: {
                                value: "12345665856",
                            },
                            countryCode: "IN",
                        },
                    },
                },
                labelSpecification: {
                    labelFormatType: "COMMON2D",
                    imageType: "PDF",
                    labelStockType: "PAPER_LETTER",
                },
                requestedPackageLineItems: [
                    {
                        weight: {
                            units: "Kg",
                            value: 2,
                        },
                        dimensions: {
                            length: 10,
                            width: 5,
                            height: 5,
                            units: "IN",
                        },
                    },
                ],
                serviceType: "FEDEX_GROUND",
                packagingType: "YOUR_PACKAGING",
            },
        };

        const response = await axios.post(
            `${FEDEX_SHIPMENT_TESTING_URL}/ship/v1/shipments`,
            shipmentData,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );
        if (!response || !response.data) {
            throw new ApiError(400, "Error unable to create shipment")
        }
        console.log("Shipment Created:", response.data);
        return response;
    } catch (error) {
        console.error("unable to create shipment in fedex", error.message)
        throw new ApiError(500, "Fedex error:unable to create shipment")
    }
}

const schedulePickup = async (trackingNumber) => {
    try {
        if (!trackingNumber) {
            throw new ApiError(400, "Tracking number is required")
        }
        const accessToken = await getFedexTokenForShipment();
        if (!accessToken) {
            throw new ApiError(400, "Unable to get access token from fedex")
        }
        const pickupData = {
            pickupType: "ON_CALL",
            accountNumber: {
                value: "FEDEX_ACCOUNT_NUMBER_FOR_SHIPMET", // Get from FedEx Developer Portal
            },
            pickupOrigin: {
                pickupLocation: {
                    contact: {
                        personName: "Sahil Rana",
                        phoneNumber: "1234567890",
                        companyName: "Sports",
                    },
                    address: {
                        streetLines: ["123 Market"],
                        city: "New Delhi",
                        postalCode: "110045",
                        countryCode: "IN",
                    },
                },
                packageLocation: "FRONT_DOOR",
            },
            pickupRequestSource: "CUSTOMER_INITIATED",
            totalWeight: {
                units: "Kg",
                value: 5.0, // Weight of the package
            },
            carrierCode: "FDXG", // FedEx Ground
            trackingNumber: trackingNumber,
            readyTimestamp: new Date().toISOString(), // Ready for pickup
            customerCloseTime: "17:00:00", // Time before which pickup should be done
        };

        const response = await axios.post(
            `${process.env.FEDEX_SHIPMENT_TESTING_URL}/pickup/v1/pickups`,
            pickupData,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response || !response.data) {
            throw new ApiError(400, "Failed to schedule pickup")
        }
        console.log("Pickup scheduler", response.data);
        return response;
    } catch (error) {
        console.error("unable to schedule pickup shipment in fedex", error.message)
        throw new ApiError(500, "Fedex error:unable to schedule pickup shipment")
    }

}

const shipmentTracking = async (trackingNumber) => {
    try {
        if (!trackingNumber) {
            throw new ApiError(400, "Tracking number is required")
        }
        const accessToken = await getFedexTokenForTracking();
        if (!accessToken) {
            throw new ApiError(400, "Unable to get access token from fedex")
        }
        const response = await axios.post(
            `${process.env.FEDEX_SHIPMENT_TESTING_URL}/track/v1/associatedshipments`,
            {
                trackingInfo: [
                    {
                        trackingNumberInfo: {
                            trackingNumber: trackingNumber,
                        },
                    },
                ],
                includeDetailedScans: true,
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );
        if (!response || !response.data) {
            throw new ApiError(400, "Failed to track the shipment")
        }
        console.log("Tracking details", response.data);
        return response;

    } catch (error) {
        console.error("unable to track shipment", error.message)
        throw new ApiError(500, "Fedex error:unable to track shipment")
    }

}

export {
    createShipment,
    schedulePickup,
    shipmentTracking
}