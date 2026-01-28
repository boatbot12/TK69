/**
 * Thai Address utilities using thai-address-database
 */

import {
    searchAddressByDistrict,
    searchAddressByZipcode
} from 'thai-address-database'

/**
 * Search for Thai addresses by query
 * @param {string} query - Search query (zipcode or sub-district name)
 * @returns {Array} Array of matching addresses
 */
export const searchAddress = (query) => {
    if (!query || query.length < 2) return []

    // Check if query is a zipcode (all digits)
    const isZipcodeQuery = /^\d+$/.test(query)

    try {
        if (isZipcodeQuery) {
            return searchAddressByZipcode(query).slice(0, 10)
        }
        return searchAddressByDistrict(query).slice(0, 10)
    } catch (error) {
        console.error('[ThaiAddress] Search error:', error)
        return []
    }
}

/**
 * Format address object to display string
 * @param {Object} address - Address object from database
 * @returns {string} Formatted address string
 */
export const formatAddressLabel = (address) => {
    if (!address) return ''
    return `${address.district}, ${address.amphoe}, ${address.province} ${address.zipcode}`
}

/**
 * Format address for form fields
 * @param {Object} address - Address object from database
 * @returns {Object} Object with form field values
 */
export const formatAddressForForm = (address) => {
    if (!address) return {}
    return {
        subDistrict: address.district,      // ตำบล/แขวง
        district: address.amphoe,           // อำเภอ/เขต
        province: address.province,         // จังหวัด
        zipcode: address.zipcode.toString()
    }
}

export default {
    searchAddress,
    formatAddressLabel,
    formatAddressForForm
}
