const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bans a user for a specific period and assigns a role temporarily.')
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

        // Define role ID and channel ID
        const roleId = '1314202753458896906'; // Replace with the role ID to assign
        const channelId = '1314202624060297338'; // Replace with the channel ID
        const imageUrl = 'https://r2.fivemanage.com/M8ZRs0ZKRHQNYpT5YIztc/SCTFORu.gif'; // Replace with your image URL

        // Validate period format (e.g., "2days")
        const periodRegex = /^(\d+)(days|hours|minutes)$/i;
        const match = period.match(periodRegex);

        if (!match) {
            return interaction.reply({
                content: 'Invalid period format! Use a format like "2days", "5hours", or "30minutes".',
                ephemeral: true
            });
        }

        const duration = parseInt(match[1]);
        const unit = match[2].toLowerCase(); // Unit of time (days, hours, minutes)
        const msDuration = moment.duration(duration, unit).asMilliseconds(); // Convert to milliseconds

        const endDate = moment().add(duration, unit).format('MMMM Do YYYY, h:mm A');

        // Fetch the target channel
        const channel = interaction.guild.channels.cache.get(channelId);
        if (!channel) {
            return interaction.reply({
                content: 'The specified channel does not exist. Please check the channel ID.',
                ephemeral: true
            });
        }

        // Fetch the member object of the user
        const member = interaction.guild.members.cache.get(user.id);
        if (!member) {
            return interaction.reply({
                content: 'The specified user is not in this server.',
                ephemeral: true
            });
        }

        // Assign the role to the user
        try {
            await member.roles.add(roleId);

            // Create the embed
            const embed = new EmbedBuilder()
                .setTitle('NightCity Roleplay')
                .setDescription(`${user} has been banned from the server for ${duration} ${unit}.`)
                .addFields(
                    { name: 'Reason', value: `\`\`\`${reason}\`\`\``, inline: false },
                    { name: 'User', value: `${user}`, inline: true },
                    { name: 'Ban Duration', value: `${duration} ${unit}`, inline: true },
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
                content: `Banned ${user}`,
                embeds: [embed]
            });

            // Acknowledge the command
            await interaction.reply({
                content: 'Ban announcement sent and role assigned!',
                ephemeral: true
            });

            // Set timeout to remove the role after the specified period
            setTimeout(async () => {
                try {
                    await member.roles.remove(roleId);
                    console.log(`Role ${roleId} removed from ${user.tag} after ${duration} ${unit}.`);
                } catch (error) {
                    console.error(`Failed to remove role from ${user.tag}:`, error);
                }
            }, msDuration);
        } catch (error) {
            console.error(`Failed to assign role to ${user.tag}:`, error);
            return interaction.reply({
                content: 'An error occurred while assigning the role.',
                ephemeral: true
            });
        }
    },
};
