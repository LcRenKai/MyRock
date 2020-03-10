const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TokenSchema = new mongoose.Schema({
    name: String,
    token: String,
    expires_in: Number,
    meta: {
        createdAt: {
            type: Date,
            default: Date.now()
        },
        updatedAt: {
            type: Date,
            default: Date.now()
        }
    }
})

TokenSchema.pre('save', (next) => {
     if(this.inNew) {
         this.meta.createdAt = this.meta.updatedAt = Data.now()
     } else {
         this.meta.updatedAt = Date.now()
     }
    next()
})

TokenSchema.statics = {
    async getAccessToken() {
        const token = await this.findOne({
            name: 'access_token'
        }).exec()

        return token
    },

    async saveAccessToken(data) {
        let token = await this.findOne({
            name: 'access_token'
        }).exec()
        
        if (token) {
            token.token = data.access_token
            token.expires_in = data.expires_in
        } else {
            token = new Token({
                name: 'access_token',
                token: data.access_token,
                expires_in: data.expires_in
            })
        }

        await token.save()
        return data
    }
}

export const Token = mongoose.model('Token', TokenSchema)