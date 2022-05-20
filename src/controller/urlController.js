const shortid = require('shortid');
const validUrl = require('valid-url');
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
const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);



// ----------------URL Shorten-----------------------------------------------------------------------------------
const urlShorten = async function (req, res) {
    try {
        const bodyData = req.body;
        if (Object.keys(bodyData).length > 0 == false) {
            return res.status(400).send({ status: false, msg: "Plz Enter Url In Body !!!" });
        }
        if (Object.keys(bodyData).length > 1 == true) {
            return res.status(400).send({ status: false, msg: "Enter Only url In Body !!!" });
        }


        const longUrl = req.body.url.trim();
        if (!longUrl) {
            return res.status(400).send({ status: false, msg: "Plz Enter url !!!" });
        }
        if (validUrl.isUri(longUrl)) {
            let reg = /^(http(s)?:\/\/)?(www.)?([a-zA-Z0-9])+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,5}(:[0-9]{1,5})?(\/[^\s]*)?$/gm
            let regex = reg.test(longUrl);
            if (regex === false) {
                return res.status(400).send({ status: false, msg: "Plz Enter Valid Url !!!" });
            }
        } else {
            return res.status(400).send({ status: false, msg: "Plz Enter Valid Url !!!" });
        }


        const urlInDb = await urlModel.findOne({ longUrl: longUrl }).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 });
        if (urlInDb) {
            return res.status(200).send({ status: true, data: urlInDb });
        }


        const urlCode = shortid.generate().toLocaleLowerCase();
        const shortUrl = "http://localhost:3000/" + urlCode;


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
        const bodyData = req.body;
        if (Object.keys(bodyData).length == 0) {


            let urlCode = req.params.urlCode; //Taking urlCode in params
            console.log(shortid.isValid(urlCode))
            if (shortid.isValid(urlCode) == false) {
                return res.status(400).send({ status: false, msg: "Plz Enter Valid UrlCode In Params !!!" });
            }


            let cahcedProfileData = await GET_ASYNC(urlCode); //finding data in cache memory by using GET_ASYNC function
            if (cahcedProfileData) {
                console.log("From Redis !!!");
                return res.status(302).redirect(cahcedProfileData);
            } else {
                console.log("From DB !!!");

                let urlFind = await urlModel.findOne({ urlCode });  //finding the urlCode in urlModel
                if (!urlFind) {
                    return res.status(404).send({ status: false, msg: "Url Not Found !!!" });
                }

                const reditData = await SET_ASYNC(urlCode, urlFind.longUrl); //we are setting the longUrl by using SET_ASYNC function  
                return res.redirect(urlFind.longUrl);
            }
        } else {
            return res.status(400).send({ status: false, msg: "Plz Don't Enter Data Inside Body !!!" });
        }
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
};



module.exports = { urlShorten, urlCode };