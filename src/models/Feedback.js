const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    id: 'feedback_modal',

    build() {
        const modal = new ModalBuilder()
            .setCustomId(this.id)
            .setTitle('Leave Feedback');

        const feedbackInput = new TextInputBuilder()
            .setCustomId('feedback_text')
            .setLabel('Tell us what we could improve')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const actionRow = new ActionRowBuilder().addComponents(feedbackInput);

        modal.addComponents(actionRow);
        return modal;
    },

    async execute(interaction) {
        const feedback = interaction.fields.getTextInputValue('feedback_text');

        console.log(`Feedback from ${interaction.user.tag}:`, feedback);

        await interaction.reply({
            content: 'Thanks for your feedback!',
            ephemeral: true
        });
    }
};
