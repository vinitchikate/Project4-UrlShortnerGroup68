const redis = require("redis");
const { promisify } = require("util");
const urlModel = require('../models/urlModel');

// ----------------Redis Connection-----------------------------------------------------------------------------------
const redisClient = redis.createClient( //Connect to the redis server
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

//Connection setup for redis
const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


// ----------------URL Shorten-----------------------------------------------------------------------------------
const urlShorten = async function (req, res) {
    try {
        const longUrl = req.body.url;
        const urlCode = req.urlCode;
        const shortUrl = "http://localhost:3000/" + urlCode;  // The API short Url endpoint + join the generated short code with the short url

        const data = {
            longUrl: longUrl,   //storing the longUrl into the newUrl object
            shortUrl: shortUrl, //storing the shortUrl into the newUrl object
            urlCode: urlCode    //storing the urlCode into the newUrl object
        };

        const mongoDb = await urlModel.create(data);  //creating the ShortUrl  
        const reditData = await SET_ASYNC(urlCode, longUrl);  //setting data in cache -> new entries
        res.status(201).send({ status: true, data: data });
    }
    catch (err) {
        res.status(500).send(err.message);
    }
};


// --------------Redirected the LongUrl-----------------------------------------------------------------------------------
const urlCode = async function (req, res) {
    try {
        let urlCode = req.params.urlCode; //Taking urlCode in params
        let cahcedProfileData = await GET_ASYNC(urlCode); //finding data in cache memory by using GET_ASYNC function

        if (cahcedProfileData) {
            console.log("From Redis !!!");
            return res.status(302).redirect(cahcedProfileData);
        } else {
            console.log("From DB !!!");
            let urlFind = await urlModel.findOne({ urlCode });  //finding the urlCode in urlModel
            const reditData = await SET_ASYNC(urlCode, urlFind.longUrl); //we are setting the longUrl by using SET_ASYNC function  
            return res.redirect(urlFind.longUrl);
        }
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
};



module.exports = { urlShorten, urlCode };