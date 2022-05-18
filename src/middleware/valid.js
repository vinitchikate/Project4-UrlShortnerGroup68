const validUrl = require('valid-url');
const urlModel = require('../models/urlModel');



const urlShorten = async function (req, res, next) {
    try {
        const longUrl = req.body.url;
        if (Object.keys(req.body) == 0) {
            return res.status(400).send({ status: false, msg: "Plz Enter Url In Body !!!" });
        }

        if (validUrl.isUri(longUrl)) {
            next();
        } else {
            return res.status(400).send({ status: false, msg: "Plz Enter Valid Url !!!" });
        }
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
};



const urlCode = async function (req, res, next) {
    try {
        next();
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
};


module.exports = { urlShorten, urlCode }