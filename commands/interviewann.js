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
        // Define the role ID to mention (hardcoded)
        const roleId = '1314202753458896906'; // Replace with the actual role ID

        // Create the embed
        const embed = new EmbedBuilder()
            .setTitle('Whitelist Section Started')
            .setDescription(
                `\`\`\`\nJoin Waiting Vc for Interview\n\`\`\`\n[**Interview Enquiry Channel**](#)\nMake sure you read rules before joining VC.`
            )
            .setImage('https://cdn.discordapp.com/attachments/1312311823650918463/1312740429158158396/nodejs.png?ex=675ac74b&is=675975cb&hm=c1eb3ee774e97ed25c9e9cf40cef514d30252ea0fe14e2fb111333ee3d7181d7&') // Replace with the actual image URL
            .setFooter({ text: 'NightCity' });

        // Create the button
        const button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Join VC')
                .setStyle(ButtonStyle.Link)
                .setURL('https://discord.com/channels/1312311823650918460/1312311823650918464') // Replace with the actual VC link
        );

        // Send the message with embed and button
        await interaction.reply({
            content: `<@&${roleId}>`, // Mention the role
            embeds: [embed],
            components: [button]
        });
    },
};
