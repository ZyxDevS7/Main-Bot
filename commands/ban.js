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

        // Hardcoded channel ID and image URL
        const channelId = '1314202624060297338'; // Replace with the channel ID
        const imageUrl = 'https://r2.fivemanage.com/M8ZRs0ZKRHQNYpT5YIztc/SCTFORu.gif'; // Replace with the URL of your image

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

        // Fetch the target channel
        const channel = interaction.guild.channels.cache.get(channelId);
        if (!channel) {
            return interaction.reply({
                content: 'The specified channel does not exist. Please check the channel ID.',
                ephemeral: true
            });
        }

        // Create the embed
        const embed = new EmbedBuilder()
            .setTitle('Night City')
            .setDescription(`Banned ${user}`)
            .addFields(
                { name: 'Reason', value: `\`\`\`${reason}\`\`\``, inline: false },
                { name: 'User', value: `${user}`, inline: true },
                { name: 'Days of Ban', value: `${duration}`, inline: true },
                { name: 'Ban End Date', value: `${endDate}`, inline: true }
            )
            .setColor('#FF0000') // Red color for ban
            .setImage(imageUrl) // Adds the provided image
            .setFooter({
                text: 'NightCity F-Team',
                iconURL: interaction.client.user.displayAvatarURL()
            });

        // Send the embed to the target channel
        await channel.send({
            content: `${user} has been banned for ${duration} days.`,
            embeds: [embed]
        });

        // Acknowledge the command
        await interaction.reply({
            content: 'Ban announcement sent!',
            ephemeral: true
        });

        // You can integrate actual ban logic here if needed (e.g., banning the user from the server).
    },
};
