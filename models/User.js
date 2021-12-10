const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'Please provide a name'],
		minlength: 3,
		maxlength: 50,
	},
	email: {
		type: String,
		required: [true, 'Please provide an email'],
		minlength: 12,
		maxlength: 100,
		match: [
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
			'Please provide a valid email',
		],
		unique: true,
	},
	password: {
		type: String,
		required: [true, 'Please provide password'],
		minlength: 6,
	},
});

// befora save userschema on DB, this method is called
// passwword will be hashed when saved on DB
UserSchema.pre('save', async function () {
	// generate a random quantity of bytes to hash password
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

// can create methods for the schema
UserSchema.methods.createJWT = function () {
	return jwt.sign(
		{
			userId: this._id,
			name: this.name,
		},
		process.env.JWT_SECRET,
		{
			expiresIn: process.env.JWT_LIFETIME,
		},
	);
};

// check if password given is the same in the BD for the user
UserSchema.methods.comparePassword = async function (password) {
	const isMatch = await bcrypt.compare(password, this.password);
	return isMatch;
};

module.exports = mongoose.model('User', UserSchema);
