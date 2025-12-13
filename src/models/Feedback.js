const { Schema, model } = require('mongoose');
const { EmbedBuilder } = require('discord.js');

const feedbackSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    userTag: {
        type: String,
        required: true
    },
    guildId: {
        type: String,
        default: null
    },
    guildName: {
        type: String,
        default: null
    },
    message: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Post-save hook - automatically posts feedback after saving
feedbackSchema.post('save', async function(doc) {
    try {
        // Import here to avoid circular dependency
        const FeedbackChannel = require('./FeedbackChannel');
        
        // Get the bot client instance from global
        const client = global.discordClient;
        
        if (!client) {
            console.log('Discord client not available for auto-posting feedback');
            return;
        }

        // Find all configured feedback channels
        const feedbackChannels = await FeedbackChannel.find({});

        if (feedbackChannels.length === 0) {
            console.log('No feedback channels configured');
            return;
        }

        for (const channelConfig of feedbackChannels) {
            try {
                const channel = await client.channels.fetch(channelConfig.channelId).catch(() => null);
                
                if (!channel) {
                    console.log(`Feedback channel ${channelConfig.channelId} not found`);
                    continue;
                }

                // Create embed for the new feedback
                const embed = new EmbedBuilder()
                    .setColor('#00ff00') // Green for new feedback
                    .setTitle('🆕 New Feedback Received')
                    .setDescription(doc.message)
                    .addFields(
                        { name: 'User', value: `${doc.userTag} (${doc.userId})`, inline: true },
                        { name: 'Source', value: doc.guildName || 'DM', inline: true }
                    )
                    .setTimestamp(doc.createdAt)
                    .setFooter({ text: 'Feedback ID: ' + doc._id });

                await channel.send({ embeds: [embed] });
                console.log(`Posted feedback ${doc._id} to channel ${channelConfig.channelId}`);
                
            } catch (error) {
                console.error(`Error posting feedback to channel ${channelConfig.channelId}:`, error);
            }
        }

    } catch (error) {
        console.error('Error in feedback post-save hook:', error);
    }
});

module.exports = model('Feedback', feedbackSchema);