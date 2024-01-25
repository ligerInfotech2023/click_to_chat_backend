const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
       username:{
        type: String
       },
       password:{
        type: String
       },
        login_time: {
            type: Date
        }
    },
    {
        collection:"tbl_user",
        timestamps:{
            createdAt:"created_date",
            updatedAt:"updated_date"
        }
    }
);

const UserSchema = mongoose.model("tbl_user", userSchema);

module.exports = UserSchema;