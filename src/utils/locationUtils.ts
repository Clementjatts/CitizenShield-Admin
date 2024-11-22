const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org";
const REQUEST_HEADERS = {
    "Accept-Language": "en",
    "User-Agent": "CitizenShield Admin",
};

interface NominatimAddress {
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    building?: string;
    amenity?: string;
    [key: string]: string | undefined;
}

export const getAddressFromCoordinates = async (
    latitude: number,
    longitude: number,
    includeCoordinates: boolean = false
): Promise<string> => {
    if (!latitude || !longitude) return "Unknown location";

    try {
        const response = await fetch(
            `${NOMINATIM_ENDPOINT}/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=18`,
            { headers: REQUEST_HEADERS }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch address");
        }

        const data = await response.json();
        const address = data.address as NominatimAddress;
        const addressParts: string[] = [];

        // Start with the most specific location details
        if (address.house_number && address.road) {
            addressParts.push(`${address.house_number} ${address.road}`);
        } else if (address.road) {
            addressParts.push(address.road);
        } else if (address.building) {
            addressParts.push(address.building);
        }

        // Add neighborhood or suburb
        if (address.neighbourhood) {
            addressParts.push(address.neighbourhood);
        } else if (address.suburb) {
            addressParts.push(address.suburb);
        }

        // Add city/town/village
        if (address.city) {
            addressParts.push(address.city);
        } else if (address.town) {
            addressParts.push(address.town);
        } else if (address.village) {
            addressParts.push(address.village);
        }

        // Add county if available
        if (address.county) {
            addressParts.push(address.county);
        }

        // Add state/region
        if (address.state) {
            addressParts.push(address.state);
        }

        // Add postal code
        if (address.postcode) {
            addressParts.push(address.postcode);
        }

        // Add country
        if (address.country) {
            addressParts.push(address.country);
        }

        // Combine all parts
        const formattedAddress = addressParts.filter(Boolean).join(", ");

        // Only add coordinates if requested
        if (includeCoordinates) {
            const coordinatesStr = `{${latitude.toFixed(6)}°N, ${longitude.toFixed(
                6
            )}°E}`;
            return formattedAddress
                ? `${formattedAddress} ${coordinatesStr}`
                : `Unknown location ${coordinatesStr}`;
        }

        return formattedAddress || "Unknown location";
    } catch (error) {
        console.error("Error getting address:", error);
        return includeCoordinates
            ? `Unknown location {${latitude.toFixed(6)}°N, ${longitude.toFixed(6)}°E}`
            : "Unknown location";
    }
};
