const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Start a whitelist application.'),
    async execute(interaction) {
        // Hardcoded IDs
        const applicationChannelId = '1320024539760955496';
        const pendingRoleId = '1322916523697770496';
        const acceptedRoleId = '1322916748730830879';
        const rejectedRoleId = '1322916699053494323';
        const acceptChannelId = '1320024686155006055';
        const pendingChannelId = '1322798711050342470';
        const rejectChannelId = '1322798746030964809';

        // Create embed for whitelist application
        const whitelistEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('Whitelist Application')
            .setDescription('Click the button below to apply for whitelisting.')
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            });

        // Add "Apply" button
        const actionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('apply_button')
                .setLabel('Apply')
                .setStyle(ButtonStyle.Primary)
        );

        // Send the embed
        await interaction.reply({
            embeds: [whitelistEmbed],
            components: [actionRow],
            ephemeral: true,
        });
    },

    async handleInteraction(interaction) {
        // Handle button interactions
        if (interaction.customId === 'apply_button') {
            // Create modal for application
            const modal = new ModalBuilder()
                .setCustomId('whitelist_modal')
                .setTitle('Whitelist Application');

            const realNameInput = new TextInputBuilder()
                .setCustomId('real_name')
                .setLabel('What is your real name?')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const realAgeInput = new TextInputBuilder()
                .setCustomId('real_age')
                .setLabel('What is your real age?')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const characterNameInput = new TextInputBuilder()
                .setCustomId('character_name')
                .setLabel('What is your character name?')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const experienceInput = new TextInputBuilder()
                .setCustomId('experience')
                .setLabel('What is your roleplay experience?')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const rulesInput = new TextInputBuilder()
                .setCustomId('rules')
                .setLabel('Did you read the rules? (Yes/No)')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(realNameInput),
                new ActionRowBuilder().addComponents(realAgeInput),
                new ActionRowBuilder().addComponents(characterNameInput),
                new ActionRowBuilder().addComponents(experienceInput),
                new ActionRowBuilder().addComponents(rulesInput)
            );

            await interaction.showModal(modal);
        } else if (interaction.customId === 'accept' || interaction.customId === 'pending' || interaction.customId === 'reject') {
            const targetUserId = interaction.message.embeds[0]?.description.match(/<@(\d+)>/)?.[1];
            const targetUser = interaction.guild.members.cache.get(targetUserId);
            const whitelistManager = interaction.user;

            let role, embedColor, embedTitle, destinationChannelId;

            if (interaction.customId === 'accept') {
                role = 'accepted';
                embedColor = 0x00ff00;
                embedTitle = 'Whitelist Accepted';
                destinationChannelId = acceptChannelId;

                // Remove pending role and add accepted role
                await targetUser.roles.add(acceptedRoleId);
                await targetUser.roles.remove(pendingRoleId);
            } else if (interaction.customId === 'pending') {
                role = 'pending';
                embedColor = 0xffa500;
                embedTitle = 'Whitelist Pending';
                destinationChannelId = pendingChannelId;

                // Add pending role
                await targetUser.roles.add(pendingRoleId);
            } else if (interaction.customId === 'reject') {
                role = 'rejected';
                embedColor = 0xff0000;
                embedTitle = 'Whitelist Rejected';
                destinationChannelId = rejectChannelId;

                // Remove pending role (if exists)
                await targetUser.roles.remove(pendingRoleId);
            }

            const resultEmbed = new EmbedBuilder()
                .setColor(embedColor)
                .setTitle(embedTitle)
                .setDescription(
                    `**User:** <@${targetUser.id}>\n**Whitelist Manager:** <@${whitelistManager.id}>`
                )
                .setTimestamp();

            const destinationChannel = interaction.guild.channels.cache.get(destinationChannelId);
            await destinationChannel.send({ embeds: [resultEmbed] });

            await interaction.reply({
                content: `The application has been marked as **${role}**.`,
                ephemeral: true,
            });
        }
    },
};
