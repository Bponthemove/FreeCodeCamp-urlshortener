const mongoose = require('mongoose')
const Schema = mongoose.Schema

const urlSchema = new Schema( 
    {
        original_url: {
            type: String,
            required: false
        },
        short_url: Number
    }
)

const Url = mongoose.model('Url', urlSchema)

module.exports = Url