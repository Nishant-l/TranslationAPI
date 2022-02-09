const axios = require("axios").default;
require('dotenv').config()
const qs = require('qs');
const getTranslate = async (text,source,target) => {
    console.log('external API called');
    const options = {
        method: 'POST',
        url: 'https://google-translate1.p.rapidapi.com/language/translate/v2',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'accept-encoding': 'application/gzip',
            'x-rapidapi-host': 'google-translate1.p.rapidapi.com',
            'x-rapidapi-key': process.env.SECRET_KEY,
        },
        data: qs.stringify({q: text, target: target, source: source})
    };
    const lnaguage = await axios(options)
    return lnaguage.data;
}

module.exports = getTranslate;