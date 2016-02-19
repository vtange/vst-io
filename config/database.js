console.log("	CONFIG/DATABASE.JS")
// config/database.js
module.exports = {

    'url' :  process.env.MONGOLAB_URI || 'mongodb://localhost/polland' // looks like mongodb://<user>:<pass>@mongo.onmodulus.net:27017/Mikha4ot

};
