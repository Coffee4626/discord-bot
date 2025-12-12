const WelcomeChannel = require('../../models/WelcomeChannel');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'guildMemberAdd',
    once: false,

    /**
     * @param {import('discord.js').GuildMember} guildMember
     */
    async execute(guildMember) {
        try {
            if (guildMember.user.bot) return;

            const welcomeConfigs = await WelcomeChannel.find({
                guildId: guildMember.guild.id
            }); 

            for (const welcomeConfig of welcomeConfigs) {
                const targetChannel =
                    guildMember.guild.channels.cache.get(welcomeConfig.channelId) ||
                    (await guildMember.guild.channels.fetch(welcomeConfig.channelId).catch(() => null));

                if (!targetChannel) {
                    await WelcomeChannel.findOneAndDelete({
                        guildId: guildMember.guild.id,
                        channelId: welcomeConfig.channelId,
                    }).catch(() => {});
                    continue;
                }

                const buttons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`guide_${welcomeConfig.guildId}`)
                        .setLabel("Guide")
                        // .setEmoji() use '123456789' id when has guild id
                        .setStyle(ButtonStyle.Primary),

                    new ButtonBuilder()
                        .setCustomId(`rules_${welcomeConfig.guildId}`)
                        .setLabel("Rules")
                        // .setEmoji() use '123456789' id when has guild id
                        .setStyle(ButtonStyle.Secondary),

                    new ButtonBuilder()
                        .setCustomId(`role_${welcomeConfig.guildId}`)
                        .setLabel("Demo Role")
                        // .setEmoji() use '123456789' id when has guild id
                        .setStyle(ButtonStyle.Success),
                    
                    new ButtonBuilder()
                        .setCustomId(`feedback_${welcomeConfig.guildId}`)
                        .setLabel("Feedback")
                        .setStyle(ButtonStyle.Secondary)
                );

                const customMessage =
                    welcomeConfig.customMessage ||
                    'Hey {username}. Welcome to {server-name}!';

                const welcomeMessage = customMessage
                    .replace('{mention-member}', `<@${guildMember.id}>`)
                    .replace('{username}', guildMember.user.username)
                    .replace('{server-name}', guildMember.guild.name);

                targetChannel.send({
                    content: welcomeMessage,
                    components: [buttons]
                }).catch(() => {});
            }
        } catch (error) {
            console.log(`Error in send-welcome-message.js:`, error);
        }
    },
};
