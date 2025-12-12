const { Schema, model } = require('mongoose')

const welcomeChannelSchema = new Schema(
    {
        guildId: {
            type: String,
            required: true,
        },
        channelId: {
            type: String,
            required: true,
            unique: true
        },
        customMessage: {
            type: String,
            default: null
        },
        guideMessage: {
            type: String,
            default: 'No guide yet'
        },
        rulesMessage: {
            type: String,
            default: 'No rules yet'
        },
        roleId: {
            type: String,
            default: null
        }
    },
    { 
        timestamps: true
    }
);

module.exports = model('WelcomeChannel', welcomeChannelSchema);