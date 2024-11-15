const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

userSchema.pre('save', async function(next) {
    try {
        if (this.isModified('password')) {
            console.log('Hashing password for user:', this.username);
            this.password = await bcrypt.hash(this.password, 10);
        }
        next();
    } catch (error) {
        console.error('Error in password hashing:', error);
        next(error);
    }
});

module.exports = mongoose.model('User', userSchema);