// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var gravatar = require('gravatar');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        username     : String,
        email        : String,
        password     : String,
		avatarURL	 : String,
		resetPasswordToken: String,
		resetPasswordExpires: Date
    }

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// generate gravatar link
userSchema.methods.generateGravatar = function(email) {
    return gravatar.url(email, {s: '200', r: 'pg', d: '404'});
};


// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
