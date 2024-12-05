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
        // Hardcoded role ID
        const roleId = '1312735645260845066'; // Replace with the role ID to mention

        // Fetch the role from the guild
        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) {
            return interaction.reply({
                content: 'The specified role does not exist. Please check the role ID.',
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

        // Send the message with the embed and role mention
        await interaction.reply({
            content: `${role}`, // Mentions the role
            embeds: [embed]
        });
    },
};
