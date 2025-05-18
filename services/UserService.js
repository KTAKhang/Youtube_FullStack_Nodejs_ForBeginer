const UserModel = require("../models/UserModel");
const RoleModel = require("../models/RolesModel");
const cloudinary = require("../config/cloudinaryConfig");

const bcrypt = require("bcrypt");
const jwtService = require("./JwtService");

// Tạo tài khoản người dùng
const createUser = async (newUser) => {
    const { user_name, password, email, role } = newUser;
    try {
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            throw { status: "ERR", message: "Email already exists" };
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        let roleData = null;
        if (role) {
            roleData = await RoleModel.findOne({ name: role });
            if (!roleData) throw { status: "ERR", message: "Role not found" };
        }

        const createdUser = await UserModel.create({
            user_name,
            email,
            password: hashedPassword,
            avatar: "https://res.cloudinary.com/dievplv1n/image/upload/v1739629508/defaultAvatar.jpg",
            role_id: roleData?._id,
        });

        const populatedUser = await UserModel.findById(createdUser._id).populate("role_id", "name -_id");

        return {
            status: "OK",
            message: "User created successfully",
            data: {
                _id: populatedUser._id,
                user_name: populatedUser.user_name,
                email: populatedUser.email,
                avatar: populatedUser.avatar,
                role_name: populatedUser.role_id.name,
                status: populatedUser.status,
                createdAt: populatedUser.createdAt,
                updatedAt: populatedUser.updatedAt,
            },
        };
    } catch (error) {
        throw error;
    }
};

// Đăng nhập
const loginUser = async ({ email, password }) => {
    try {
        const user = await UserModel.findOne({
            email: { $regex: new RegExp(`^${email}$`, "i") },
        });

        if (!user) throw { status: "ERR", message: "Account does not exist" };
        if (user.status === false) throw { status: "ERR", message: "Account is blocked" };

        const passwordMatch = bcrypt.compareSync(password, user.password);
        if (!passwordMatch) throw { status: "ERR", message: "Incorrect password" };

        const accessToken = await jwtService.generalAccessToken({
            id: user._id,
            isAdmin: user.isAdmin,
        });

        const populatedUser = await UserModel.findById(user._id).populate("role_id", "name -_id");

        return {
            status: "OK",
            message: "Login success",
            data: {
                _id: populatedUser._id,
                user_name: populatedUser.user_name,
                email: populatedUser.email,
                avatar: populatedUser.avatar,
                role_name: populatedUser.role_id.name,
                status: populatedUser.status,
                createdAt: populatedUser.createdAt,
                updatedAt: populatedUser.updatedAt,
            },
            token: {
                access_token: accessToken,
            },
        };
    } catch (error) {
        throw error;
    }
};