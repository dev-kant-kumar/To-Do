const {mongoose} =require('mongoose')
const Schema =mongoose.Schema

const TodoSchema =new Schema({

    task:{
        type:String,
        required:true,
    },
    completed:{
        type:Boolean,
        required:true,
    },
    starred:{
        type:Boolean,
        required:true,
    },
    deleted:{
        type:Boolean,
        required:true,
    },
    date:{
        type:String,
        required:true,
    }
})

module.exports =mongoose.model("todo",TodoSchema);