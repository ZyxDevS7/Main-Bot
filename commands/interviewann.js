const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('interviewannounce')
        .setDescription('Announces the start of the whitelist interview section.'),
    permissions: [
        process.env.ADMIN_ROLE,
        process.env.MODERATOR_ROLE
    ],
    async execute(interaction) {
        // Hardcoded role and channel IDs
        const roleId = '1317411421566406706'; // Replace with the role ID to mention
        const channelId = '1317411331862691891'; // Replace with the channel ID where the message should be sent

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
                .setURL('https://discord.com/channels/1312311823650918460/1312311823650918464') // Replace with the actual VC link
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
