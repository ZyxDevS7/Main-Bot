const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('patchnotes')
        .setDescription('Announce patch notes to the server.')
        .addStringOption(option =>
            option
                .setName('title')
                .setDescription('The title of the patch note (e.g., Patch Note 1.9).')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('added')
                .setDescription('The items added in this patch (separate by line).')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('updates')
                .setDescription('The items updated in this patch (separate by line).')
                .setRequired(false)
        ),
    async execute(interaction) {
        // Hardcoded settings
        const imageUrl = 'https://r2.fivemanage.com/M8ZRs0ZKRHQNYpT5YIztc/SCTFORu.gif'; // Replace with your image URL
        const roleId = '1317411421566406706'; // Replace with your role ID

        // Get user inputs
        const title = interaction.options.getString('title');
        const added = interaction.options.getString('added');
        const updates = interaction.options.getString('updates');

        // Create the embed
        const patchEmbed = new EmbedBuilder()
            .setColor(0x990099) // Red color
            .setAuthor({
                name: 'NightCity',
                iconURL: 'https://example.com/logo.png', // Replace with your logo URL
            })
            .setTitle(title)
            .setDescription('These updates are here to improve gameplay')
            .addFields(
                {
                    name: 'ADDED',
                    value: `\`\`\`\n${added}\n\`\`\``,
                    inline: false,
                },
                {
                    name: 'UPDATES',
                    value: `\`\`\`\n${updates}\n\`\`\``,
                    inline: false,
                }
            )
            .setImage(imageUrl)
            .setFooter({
                text: `Nrp Dev Team • ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();

        // Send the message to the same channel where the command is used
        const channel = interaction.channel;

        await channel.send({
            content: `<@&${roleId}>`, // Mention the role
            embeds: [patchEmbed],
        });

        // Acknowledge the interaction (ephemeral reply to avoid errors)
        await interaction.reply({ content: 'Patch note sent successfully!', ephemeral: true });
    },
};
