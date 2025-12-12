const { MessageFlags } = require('discord.js');
const feedbackModal = require('../../models/Feedback.js');
const WelcomeChannel = require('../../models/WelcomeChannel.js')

module.exports = {
    name: 'interactionCreate',
    once: false,

    /**
     * @param {import("discord.js").Interaction} interaction
     * @param {import("discord.js").Client} client
     */
    async execute(interaction, client) {

        
        if (interaction.isButton()) {
            if (interaction.customId === 'leave_feedback') {
                return interaction.showModal(feedbackModal.build());
            }

            if (interaction.customId === 'skip_feedback') {
                await interaction.deferReply({ ephemeral: true });
                return interaction.followUp({
                    content: 'Thanks anyway! Hope to see you again.',
                    flags: MessageFlags.Ephemeral
                });
            }
            
            const guildId = interaction.guildId;
            const config = await WelcomeChannel.findOne({ guildId }).catch(() => null);

            if (!config)
                return interaction.followUp({
                    content: '⚠️ This server has no welcome configuration set.',
                    flags: MessageFlags.Ephemeral
                });

            if (interaction.customId === `guide_${guildId}`) {
                await interaction.deferReply({ ephemeral: true });
                return interaction.followUp({
                    content: `📘 **Server Guide:**\n${config.guideMessage}`,
                    flags: MessageFlags.Ephemeral
                });
            }

            if (interaction.customId === `rules_${guildId}`) {
                await interaction.deferReply({ ephemeral: true });
                return interaction.followUp({
                    content: `📜 **Server Rules:**\n${config.rulesMessage}`,
                    flags: MessageFlags.Ephemeral
                });
            }

            if (interaction.customId === `role_${guildId}`) {
                await interaction.deferReply({ ephemeral: true });
                const role = interaction.guild.roles.cache.get(config.roleId);

                if (!role) {
                    return interaction.followUp({
                        content: "⚠️ Demo role is not configured or no longer exists.",
                        flags: MessageFlags.Ephemeral
                    });
                }

                await interaction.member.roles.add(role).catch(() => null);
                return interaction.followUp({
                    content: `🎖️ You've been given the **${role.name}** role!`,
                    flags: MessageFlags.Ephemeral
                });
            }

            if (interaction.isButton() && interaction.customId.startsWith("feedback_")) {
                return interaction.showModal(feedbackModal.build());
            }
        }

        if (interaction.isModalSubmit()) {
            if (interaction.customId === feedbackModal.id) {
                return feedbackModal.execute(interaction);
            }
        }

        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (err) {
                console.error(err);
                return interaction.followUp({
                    content: 'There was an error executing that command.',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }
};
