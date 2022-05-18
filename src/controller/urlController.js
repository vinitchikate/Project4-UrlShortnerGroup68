const validUrl = require('valid-url');
const shortid = require('shortid');
const redis = require("redis");
const { promisify } = require("util");
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

        if (validUrl.isUri(longUrl)) {
            const saveData = await urlModel.create(data);
            res.status(200).send({ data: saveData });
        } else {
            return res.status(400).send({ status: false, msg: "Plz Enter Valid Url !!!" });
        }
    }
    catch (err) {
        res.status(500).send(err.message);
    }
};



const urlCode = async function (req, res) {
    try {
        const redisClient = redis.createClient(
            15622,
            "redis-15622.c301.ap-south-1-1.ec2.cloud.redislabs.com",
            { no_ready_check: true }
        );
        redisClient.auth("Qz26M7M1BPGbNHJqNNcFdhmcfxP3FLNI", function (err) {
            if (err) throw err;
        });

        redisClient.on("connect", async function () {
            console.log("Redis Is Connected ...");
        });

        const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
        const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);

        let cahcedProfileData = await GET_ASYNC(`${req.params.urlCode}`)
        if (cahcedProfileData) {
            console.log("If Part Executed");
            res.send(cahcedProfileData)
        } else {
            console.log("Else Part Executed");
            let findUrl = await urlModel.findOne({ urlCode: req.params.urlCode });
            if (!findUrl) {
                return res.status(404).send({ status: false, message: 'URL not found.' });
            }
            await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(findUrl))
            res.status(200).send({ data: findUrl });
        }
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
};



module.exports = { urlShorten, urlCode };
