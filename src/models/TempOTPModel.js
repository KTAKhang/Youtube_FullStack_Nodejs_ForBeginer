const mongoose = require("mongoose");

const tempOTPSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    user_name: { type: String, required: true },
    password: { type: String, required: true },
});

const TempOTPModel = mongoose.model("temp_otps", tempOTPSchema);
module.exports = TempOTPModel;