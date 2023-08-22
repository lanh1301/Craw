/**
 * Check if a string is null or undefined or empty
 * @param   {string}  str The string that needs to be checked
 * @returns {boolean}
 */
const isEmpty = (str) => (!str || str.trim().length === 0)

/**
 * Check if a string is a valid number
 * @param   {string}  str The string that needs to be checked
 * @returns {boolean}
 */
const isNumeric = (str) => {
    if (typeof str != "string")
        return false 
    return !isNaN(str) && !isNaN(parseFloat(str))
}

/**
 * Remove punctuation from a string by using regular expression
 * @param   {string} str   The string that needs to be cleaned
 * @param   {string} regex The regular expression is used to search string
 * @returns {string} A new string with characters that match the regex has been removed 
 */
const removePunctuation = (str, regex = /-/) => str.replace(regex, "").trim()

/**
 * Generate default data of employer
 * @returns The default object data of employer
 */
const generateEmployerData = () => {
    return {
        title: '',
        address: '',
        location: '',
        email: '',
        logo: '',
        phone: '',
        website: '',
        category: '',
        description: '',
        numberOfEmployees: '',
        sourceLink: '',
        sourceBrandname: ''
    }
}

const generateEmployerDataTrangVang = () => {
    return {
        category:'',
        title: '',
        address: '',
        location: '',
        email: '',
        email_valid :'',
        logo: '',
        phone: '',
        fax:'',
        website: '',
        companyType: '',
        mainMarketing:'',
        description: '',
        industry:'',
        serviceProduction:'',
        imgage:{},
        taxCode:'',
        foundedYear:'',
        numberOfEmployees: '',
        certification:'',
        sourceLink: '',
        sourceBrandname: ''
    }
}

const generateErichementData = () => {
       
    return {
        title: '',
        mst:'',
        phone: '',
        email: '',
    }
}


/**
 * Generate default data of Restaurant
 * @returns The default object data of Restaurant
 */
const generateRestaurantData = () => {
       
    
    return {
        title: '',
        address: '',
        email: '',
        phone: '',
        description: '',
        sourceBrandname: '',
        website: '',
        timeserver: '',
        BusinessHours: '',
        CloseTime: ''
    }
}

/**
 * Generate default data of AccommodationFacility
 * @returns The default object data of AccommodationFacility
 */
const generateAccommodationFacilityData = () => {
    return {
        title: '',
        address: '',
        email: '',
        phone: '',
        description: '',
        sourceBrandname: '',
        website: '',
        roomNumber: '',
        censorship: '',
        logo:'',
        utilities:'',
        
    }
}



/**
 * Capitalize first character in the input string
 * @param {string} string The input string to capitalize the first character
 * @returns String with the first character capitalized
 */
const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Generates a string showing the current time with the format dd/m/yyyy @ H:i:s
 */
const getCurrentDateTime = () => {
    let currentdate = new Date(); 
    let datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
    return datetime;
}

/**
 * Make an API call to push Job Posting to our data warehouse
 * @param   {object} payload The JSON payload of Job Posting
 */
const pushData = async (payload) => {
    await fetch('https://viecmoi.co/index.php?rest_route=/job/v1/add', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    }).then((response) => {
        if ( response.ok ) {
            return response.json()
        } else
            console.log('Failed: %s', request.url)
    }).then((json) => {
        if ( 'status' in json && json['status'] !== 'ok' ) {
            console.log('Failed: %s. Response: %s', request.url, JSON.stringify(json))
        }
    })
    .catch((error) => {
        console.log(error)
    })
}


export {
    isEmpty,
    isNumeric,
    removePunctuation,
    generateEmployerData,
    capitalizeFirstLetter,
    getCurrentDateTime,
    generateRestaurantData,
    generateAccommodationFacilityData,
    generateErichementData,
    generateEmployerDataTrangVang
}