const validurl = require('valid-url');
const shortid = require('shortid');
const urlModel = require('../models/urlModel');



const urlShorten = async function (req, res) {
    try {
        const longUrl = req.body.url;
        const urlCode = shortid.generate();
        const shortUrl = "http://localhost:3000/" + urlCode;

        const data = {
            longUrl: longUrl,
            shortUrl: shortUrl,
            urlCode: urlCode
        };
        const saveData = await urlModel.create(data);
        res.status(200).send({ data: saveData });
    }
    catch (err) {
        res.status(500).send(err.message);
    }
};



const urlCode = async function (req, res) {
    try {
        let urlCode = req.params.urlCode

        let findUrl = await urlModel.findOne({ urlCode: urlCode })
        if (!findUrl)
            return res.status(404).send({ status: false, message: 'URL not found.' })

        res.status(200).send({ status: true, message: 'Redirecting to Original URL.', data: findUrl.longUrl })

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
};



module.exports = { urlShorten, urlCode };
