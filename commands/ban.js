const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user for a specific period.')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user to ban')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('period')
                .setDescription('The duration of the ban (e.g., 2days, 5days)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(true)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const period = interaction.options.getString('period');
        const reason = interaction.options.getString('reason');

        // Validate period format (e.g., "2days")
        const periodRegex = /^(\d+)(days)$/i;
        const match = period.match(periodRegex);

        if (!match) {
            return interaction.reply({
                content: 'Invalid period format! Use a format like "2days".',
                ephemeral: true
            });
        }

        const duration = parseInt(match[1]); // Number of days
        const endDate = moment().add(duration, 'days').format('MMMM Do YYYY, h:mm A');

        // Create the embed
        const embed = new EmbedBuilder()
            .setTitle('Night City')
            .setDescription(`${user} has been banned from the server for ${duration} days.`)
            .addFields(
                { name: 'Reason', value: `\`\`\`${reason}\`\`\``, inline: false },
                { name: 'User', value: `${user}`, inline: true },
                { name: 'Days of Ban', value: `${duration}`, inline: true },
                { name: 'Ban End Date', value: `${endDate}`, inline: true }
            )
            .setColor('#FF0000') // Red color for ban
            .setFooter({ text: 'Night City Frp-Team', iconURL: interaction.client.user.displayAvatarURL() });

        // Send the embed
        await interaction.reply({
            content: `${user} has been banned for ${duration} days.`,
            embeds: [embed]
        });

        // You can integrate actual ban logic here if needed (e.g., banning the user from the server).
    },
};
