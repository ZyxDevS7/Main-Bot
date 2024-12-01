const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Send a message as the bot.')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to send')
                .setRequired(true))
        .addAttachmentOption(option =>
            option.setName('attachment')
                .setDescription('Optional file to attach')),
    permissions: [
        process.env.ADMIN_ROLE,
        process.env.MODERATOR_ROLE
    ],
    async execute(interaction) {
        const messageContent = interaction.options.getString('message');
        const attachment = interaction.options.getAttachment('attachment');

        // Build the response payload
        const responsePayload = { content: messageContent };

        if (attachment) {
            const file = new AttachmentBuilder(attachment.url);
            responsePayload.files = [file];
        }

        try {
            // Send the message to the same channel where the command was used
            await interaction.channel.send(responsePayload);

            // Acknowledge the command
            await interaction.reply({ content: 'Message sent!', ephemeral: true });
        } catch (error) {
            console.error('Error sending message:', error);
            await interaction.reply({ content: 'There was an error sending the message.', ephemeral: true });
        }
    },
};
