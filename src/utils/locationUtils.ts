const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org';
const REQUEST_HEADERS = {
    'Accept-Language': 'en',
    'User-Agent': 'CitizenShield Admin'
};

export const getAddressFromCoordinates = async (latitude: number, longitude: number): Promise<string> => {
    if (!latitude || !longitude) return "Unknown location";
    
    try {
        const response = await fetch(
            `${NOMINATIM_ENDPOINT}/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: REQUEST_HEADERS }
        );
        
        // Add delay to respect Nominatim's usage policy (max 1 request per second)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const data = await response.json();
        
        if (data.address) {
            const parts = [];
            if (data.address.house_number) parts.push(data.address.house_number);
            if (data.address.road) parts.push(data.address.road);
            if (data.address.neighbourhood) parts.push(data.address.neighbourhood);
            if (data.address.suburb) parts.push(data.address.suburb);
            if (data.address.city) parts.push(data.address.city);
            else if (data.address.town) parts.push(data.address.town);
            else if (data.address.village) parts.push(data.address.village);
            if (data.address.county) parts.push(data.address.county);
            if (data.address.state_district) parts.push(data.address.state_district);
            if (data.address.state) parts.push(data.address.state);
            if (data.address.postcode) parts.push(data.address.postcode);
            
            return parts.join(", ") || "Unknown location";
        }
        return "Unknown location";
    } catch (error) {
        console.error('Error getting address:', error);
        return "Unknown location";
    }
};
