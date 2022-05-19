const shortid = require('shortid');
const urlModel = require('../models/urlModel');

function isValidURL(string) {
    var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return (res !== null)
};

const urlShorten = async function (req, res, next) {
    try {
        const longUrl = req.body.url;
        if (Object.keys(req.body) == 0) {
            return res.status(400).send({ status: false, msg: "Plz Enter Url In Body !!!" });
        }

        if (isValidURL(longUrl) == true) { // Regex To Validate Url
            let urlCode = shortid.generate();
            const shortidFind = await urlModel.findOne({ urlCode: urlCode });

            if (shortidFind) { //Checking ShortId Is Unique Or Not
                urlCode = shortid.generate();
                req["urlCode"] = urlCode.trim().toLowerCase();
            } else {
                req["urlCode"] = urlCode.trim().toLowerCase();
            }

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