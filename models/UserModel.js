const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
    {
        user_name: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        avatar: { type: String },
        role_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "roles",
            required: true,
        },
        resetPasswordOTP: { type: String },
        resetPasswordExpires: { type: Date },
        status: { type: Boolean, default: true },
        access_token: { type: String, required: false },
    },
    {
        timestamps: true,
    }
);

const UserModel = mongoose.model("users", userSchema);
module.exports = UserModel;