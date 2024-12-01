const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('servermaintenance')
        .setDescription('Send a server status message')
        .addStringOption(option =>
            option.setName('status')
                .setDescription('Select server status')
                .setRequired(true)
                .addChoices(
                    { name: 'Server Restarted', value: 'restarted' },
                    { name: 'Server Under Maintenance', value: 'maintenance' }
                )),
    async execute(interaction) {
        // Check if the user has Admin role
        const adminRoleId = process.env.ADMIN_ROLE; // Admin role ID from .env file
        if (!interaction.member.roles.cache.has(adminRoleId)) {
            return interaction.reply({
                content: 'You do not have the required permissions to use this command.',
                ephemeral: true
            });
        }

        const status = interaction.options.getString('status');

        // Embed details
        const serverName = 'Your Server Name'; // Replace with your server's name
        const footerIcon = 'https://cdn.discordapp.com/attachments/1312311823650918463/1312740429158158396/nodejs.png?ex=674d984b&is=674c46cb&hm=fb543f2e8a63c666d46b371970f56fa27750bf1494fbfcbc9d00241f2d5ae2e6&'; // Replace with your footer icon URL
        const footerName = 'Server Status'; // Replace with your footer name
        const restartedGif = 'https://cdn.discordapp.com/attachments/1312311823650918463/1312740429158158396/nodejs.png?ex=674d984b&is=674c46cb&hm=fb543f2e8a63c666d46b371970f56fa27750bf1494fbfcbc9d00241f2d5ae2e6&'; // Replace with your "restarted" image/GIF URL
        const maintenanceGif = 'https://cdn.discordapp.com/attachments/1312311823650918463/1312740429158158396/nodejs.png?ex=674d984b&is=674c46cb&hm=fb543f2e8a63c666d46b371970f56fa27750bf1494fbfcbc9d00241f2d5ae2e6&'; // Replace with your "maintenance" image/GIF URL

        let embed;

        if (status === 'restarted') {
            embed = new EmbedBuilder()
                .setTitle(serverName)
                .setDescription('The Server Has Been Successfully Restarted. Connect Through IP. Enjoy Roleplay!')
                .setImage(restartedGif)
                .setFooter({ text: footerName, iconURL: footerIcon })
                .setColor('Green');
        } else if (status === 'maintenance') {
            embed = new EmbedBuilder()
                .setTitle(serverName)
                .setDescription("The Server Is Under Maintenance. Please wait until it's online. Don't try to connect.")
                .setImage(maintenanceGif)
                .setFooter({ text: footerName, iconURL: footerIcon })
                .setColor('Red');
        }

        // Send the embed message to the same channel without replying to the command
        await interaction.channel.send({ embeds: [embed] });

        // Optionally, you can acknowledge the command without replying
        await interaction.deferReply();
    },
};
