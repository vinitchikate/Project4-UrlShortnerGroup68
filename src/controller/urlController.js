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
        res.status(200).send({ status: true });
    }
    catch (err) {
        res.status(500).send(err.message);
    }
};



module.exports = { urlShorten, urlCode };