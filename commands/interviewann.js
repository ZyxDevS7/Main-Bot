const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('interviewannounce')
        .setDescription('Announces the start of the whitelist interview section.'),
    async execute(interaction) {
        // Define the role IDs allowed to use this command
        const allowedRoles = ['1307225215255707719']; // Replace with your staff role ID(s)

        // Check if the user has one of the allowed roles
        const hasRole = interaction.member.roles.cache.some(role => allowedRoles.includes(role.id));

        if (!hasRole) {
            return interaction.reply({
                content: 'You do not have permission to use this command.',
                ephemeral: true // Only visible to the user
            });
        }

        // Hardcoded role and channel IDs
        const roleId = '1315752587559174234'; // Replace with the role ID to mention
        const channelId = '1316366281389375508'; // Replace with the channel ID where the message should be sent

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
            .setTitle('GREENID INTERVIEW')
            .setDescription(
                `\`\`\`\nJoin Waiting VC for Interview📢\n\`\`\`\n\`\`\`\nRead The Rules📜\n\`\`\``
            )
            .setImage('https://r2.fivemanage.com/M8ZRs0ZKRHQNYpT5YIztc/SCTFORu.gif') // Replace with the actual image URL
            .setFooter({ text: 'Night City' });

        // Create the button
        const button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Join VC')
                .setStyle(ButtonStyle.Link)
                .setURL('https://discord.com/channels/1120436484806287493/1316318559852429333') // Replace with the actual VC link
        );

        // Send the message to the target channel
        await channel.send({
            content: `<@&${roleId}>`, // Mention the role
            embeds: [embed],
            components: [button]
        });

        // Acknowledge the command
        await interaction.reply({ content: 'Announcement sent!', ephemeral: true });
    },
};
