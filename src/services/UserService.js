const UserModel = require("../models/UserModel");
const RoleModel = require("../models/RolesModel");
const cloudinary = require("../config/cloudinaryConfig");

const bcrypt = require("bcrypt");
const jwtService = require("./JwtService");


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
            avatar: "https://res.cloudinary.com/dkbsae4kc/image/upload/v1748833551/avatars/wshzvhgdgn6jspttmz1o.png",
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


const loginUser = async ({ email, password }) => {
    try {
        const user = await UserModel.findOne({
            email: { $regex: new RegExp(`^${email}$`, "i") },
        });

        if (!user) throw { status: "ERR", message: "Account does not exist" };
        if (user.status === false) throw { status: "ERR", message: "Account is blocked" };

        const passwordMatch = bcrypt.compareSync(password, user.password);
        if (!passwordMatch) throw { status: "ERR", message: "Incorrect password" };


        const populatedUser = await UserModel.findById(user._id).populate("role_id", "name -_id");
        const roleName = populatedUser?.role_id?.name || "customer";


        const accessToken = await jwtService.generalAccessToken({
            _id: user._id,
            isAdmin: roleName === "admin",
            role: roleName,
        });




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

const updateUser = async (id, data, file, role) => {
    try {
        const checkUser = await UserModel.findById(id);
        if (!checkUser) {
            return { status: "ERR", message: "User does not exist" };
        }
        if (data.email) {
            const userWithSameName = await UserModel.findOne({
                email: data.email,
            });
            if (userWithSameName && userWithSameName._id.toString() !== id) {
                return { status: "ERR", message: "Email already exists" };
            }
        }

        if (role !== "admin") {
            if (
                data.role ||
                data.status
            ) {
                return {
                    status: "ERR",
                    message: "You are not allowed to change this information",
                };
            }
        }
        let roleData;
        if (data.role) {
            roleData = await RoleModel.findOne({ name: data.role });
            if (!roleData) {
                return { status: "ERR", message: "Role not found" };
            } else {
                data.role_id = roleData._id;
            }
        }

        if (file) {
            if (checkUser.avatar) {
                const oldImageId = checkUser.avatar.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(`avatars/${oldImageId}`);
            }

            const uploadResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "avatars" },
                    (error, result) => (error ? reject(error) : resolve(result))
                );
                uploadStream.end(file.buffer);
            });

            data.avatar = uploadResult.secure_url;
        }

        const isStrictPassword = (password) => {
            const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
            return regex.test(password);
        };


        if (data.password) {
            if (!isStrictPassword(data.password)) {
                return {
                    status: "ERR",
                    message:
                        "Password must contain at least 8 characters, including uppercase and number",
                };
            }

            if (data.password !== checkUser.password) {
                data.password = bcrypt.hashSync(data.password, 10);
            }
        }

        const updateData = await UserModel.findByIdAndUpdate(
            id,
            {
                user_name: data.user_name || checkUser.user_name,
                email: data.email || checkUser.email,
                password: data.password || checkUser.password,
                role_id: data.role_id || checkUser.role_id,
                avatar: data.avatar || checkUser.avatar,
                status: data.status || checkUser.status,
            },
            { new: true }
        );

        const dataUser = await UserModel.findById(updateData._id).populate(
            "role_id",
            "name -_id"
        );

        const dataOutput = {
            _id: dataUser._id,
            user_name: dataUser.user_name,
            password: dataUser.password,
            role_name: dataUser.role_id.name,
            avatar: dataUser.avatar,
            status: dataUser.status,
            createdAt: dataUser.createdAt,
            updatedAt: dataUser.updatedAt,
        };

        return {
            status: "OK",
            message: "Update success",
            data: dataOutput,
        };
    } catch (error) {
        return { status: "ERR", message: error.message };
    }
};

const getAllUser = (page, limit, search = "") => {
    return new Promise(async (resolve, reject) => {
        try {

            const query = search
                ? {
                    $or: [
                        { user_name: { $regex: search, $options: "i" } },
                        { email: { $regex: search, $options: "i" } },
                    ],
                }
                : {};

            const listUser = await UserModel.find(query).populate("role_id", "name -_id");

            let listUserData = listUser.map((user) => ({
                _id: user._id,
                user_name: user.user_name,
                email: user.email,
                password: user.password,
                role_name: user.role_id.name,
                department: user.department,
                job_rank: user.job_rank,
                salary: user.salary,
                avatar: user.avatar,
                status: user.status,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }));


            listUserData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const totalUser = listUserData.length;
            const totalActive = listUserData.filter(u => u.status === true).length;
            const totalInactive = listUserData.filter(u => u.status === false).length;
            const totalPage = limit ? Math.ceil(totalUser / limit) : 1;
            const currentPage = page || 1;
            const paginatedUsers = (page && limit)
                ? listUserData.slice((page - 1) * limit, page * limit)
                : listUserData;

            const dataOutput = {
                total: {
                    currentPage,
                    totalUser,
                    totalPage,
                    totalActive,
                    totalInactive,
                },
                user: paginatedUsers,
            };

            resolve({
                status: "OK",
                message: "Successfully get all user",
                data: dataOutput,
            });
        } catch (error) {
            reject(error);
        }
    });
};


const getUserById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const userDetail = await UserModel.findById(id);
            if (!userDetail) {
                resolve({
                    status: "ERR",
                    message: "User does not exist",
                });
            }
            const dataUser = await UserModel.findById(userDetail._id).populate(
                "role_id",
                "name -_id"
            );

            const dataOutput = {
                _id: dataUser._id,
                user_name: dataUser.user_name,
                email: dataUser.email,
                password: dataUser.password,
                role_name: dataUser.role_id.name,
                avatar: dataUser.avatar,
                status: dataUser.status,
                createdAt: dataUser.createdAt,
                updatedAt: dataUser.updatedAt,
            };
            if (!userDetail) {
                resolve({
                    status: "ERR",
                    message: "User does not exist",
                });
            }
            resolve({
                status: "OK",
                message: "Successfully get user",
                data: dataOutput,
            });
        } catch (error) {
            reject(error);
        }
    });
};

const changePassword = async (userID, old_password, new_password) => {
    try {
        const checkUser = await UserModel.findById(userID);
        if (!checkUser) {
            return { status: "ERR", message: "User does not exist" };
        }
        const checkPassword = bcrypt.compareSync(old_password, checkUser.password);
        if (!checkPassword) {
            return { status: "ERR", message: "Old password is incorrect" };
        }
        const isStrictPassword = (password) => {
            const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
            return regex.test(password);
        };
        if (!isStrictPassword(new_password)) {
            return {
                status: "ERR",
                message:
                    "Password must contain at least 8 characters, including uppercase and number",
            };
        }
        const hash = bcrypt.hashSync(new_password, 10);
        const updateData = await UserModel.findByIdAndUpdate(
            userID,
            {
                password: hash,
            },
            { new: true }
        );
        const dataUser = await UserModel.findById(updateData._id).populate(
            "role_id",
            "name -_id"
        );
        const dataOutput = {
            _id: dataUser._id,
            email: dataUser.email,
            user_name: dataUser.user_name,
            password: dataUser.password,
            role_name: dataUser.role_id.name,
            avatar: dataUser.avatar,
            status: dataUser.status,
            createdAt: dataUser.createdAt,
            updatedAt: dataUser.updatedAt,
        };
        return {
            status: "OK",
            message: "Change password success",
            data: dataOutput,
        };
    } catch (error) {
        return { status: "ERR", message: error.message };
    }
};

module.exports = {
    createUser,
    loginUser,
    updateUser,
    getAllUser,
    getUserById,
    changePassword,
};
