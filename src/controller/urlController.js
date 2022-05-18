const shortid = require('shortid');
const redis = require("redis");
const { promisify } = require("util");
const urlModel = require('../models/urlModel');


const redisClient = redis.createClient(
    15622,
    "redis-15622.c301.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("Qz26M7M1BPGbNHJqNNcFdhmcfxP3FLNI", function (err) {
    if (err) throw err;
});
redisClient.on("connect", async function () {
    console.log("Redis Is Connected");
});
const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);



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

        const mongoDb = await urlModel.create(data);
        const reditData = await SET_ASYNC(urlCode, longUrl);
        res.status(200).send({ stauts: true, data: data });
    }
    catch (err) {
        res.status(500).send(err.message);
    }
};



const urlCode = async function (req, res) {
    try {
        let urlCode = req.params.urlCode;
        let cahcedProfileData = await GET_ASYNC(urlCode);

        if (cahcedProfileData) {
            return res.status(302).redirect(cahcedProfileData);
        } else {
            let urlFind = await urlModel.findOne({ urlCode });
            const reditData = await SET_ASYNC(urlCode, urlFind.longUrl);
            return res.redirect(urlFind.longUrl);
        }
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
};



module.exports = { urlShorten, urlCode };