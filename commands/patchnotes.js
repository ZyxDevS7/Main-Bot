const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');

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
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('image')
                .setDescription('A URL to an image for the patch note (optional).')
                .setRequired(false)
        ),
    async execute(interaction) {
        const title = interaction.options.getString('title');
        const added = interaction.options.getString('added');
        const updates = interaction.options.getString('updates');
        const imageUrl = interaction.options.getString('image');

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
            .setFooter({
                text: `Nrp Dev Team • ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setTimestamp();

        if (imageUrl) {
            patchEmbed.setImage(imageUrl);
        }

        const actionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Join Us')
                .setStyle(ButtonStyle.Link)
                .setURL('https://discord.gg/example') // Replace with your invite link
        );

        // Send the embed
        await interaction.reply({
            content: '@USER', // Mention the desired role
            embeds: [patchEmbed],
            components: [actionRow],
        });
    },
};
