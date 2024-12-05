const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('servermain')
        .setDescription('Announces server maintenance.'),
    permissions: [
        process.env.ADMIN_ROLE,
        process.env.MODERATOR_ROLE
    ],
    async execute(interaction) {
        // Hardcoded role ID and channel ID
        const roleId = '1312735645260845066'; // Replace with the role ID to mention
        const channelId = '1314199196756349020'; // Replace with the channel ID to send the message

        // Fetch the role from the guild
        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) {
            return interaction.reply({
                content: 'The specified role does not exist. Please check the role ID.',
                ephemeral: true
            });
        }

        // Fetch the channel from the guild
        const channel = interaction.guild.channels.cache.get(channelId);
        if (!channel) {
            return interaction.reply({
                content: 'The specified channel does not exist. Please check the channel ID.',
                ephemeral: true
            });
        }

        // Create the embed
        const embed = new EmbedBuilder()
            .setTitle('Server Under Maintenance')
            .setDescription('Server is Currently Down For Maintenance, Please Wait.')
            .setThumbnail('https://cdn.discordapp.com/attachments/1312311823650918463/1312740429158158396/nodejs.png?ex=6752de4b&is=67518ccb&hm=340fa4551a9796e280ec5de98b1c446edaeee47fdfcd4148db2e91e5f877613f&') // Replace with the thumbnail URL
            .setImage('https://cdn.discordapp.com/attachments/1312311823650918463/1312740429158158396/nodejs.png?ex=6752de4b&is=67518ccb&hm=340fa4551a9796e280ec5de98b1c446edaeee47fdfcd4148db2e91e5f877613f&') // Replace with the GIF URL
            .setFooter({
                text: 'Nrp Developer Team',
                iconURL: interaction.client.user.displayAvatarURL()
            });

        // Send the message in the specified channel
        await channel.send({
            content: `${role}`, // Mentions the role
            embeds: [embed]
        });

        // Reply to the user confirming the action
        await interaction.reply({
            content: 'The server maintenance announcement has been posted.',
            ephemeral: true
        });
    },
};
