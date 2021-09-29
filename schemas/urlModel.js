const mongoose = require('mongoose')
const Schema = mongoose.Schema

const urlSchema = new Schema( 
    {
        full_url: {
            type: String,
            required: false
        },
        short_url: Number
    }
)

const Url = mongoose.model('Url', urlSchema)

module.exports = Url