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
        // Hardcoded channel and role IDs
        const applicationChannelId = '1320024539760955496';
        const pendingRoleId = '1322916523697770496';
        const acceptedRoleId = '1322916748730830879';
        const rejectedRoleId = '1322916699053494323';
        const acceptChannelId = '1320024686155006055';
        const pendingChannelId = '1322798711050342470';
        const rejectChannelId = '1322798746030964809';

        // Create the main embed
        const whitelistEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('Whitelist Application')
            .setDescription('Click the button below to apply for whitelisting.')
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            });

        // Add the Apply button
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

        // Listen for button interactions
        const filter = i => i.customId === 'apply_button' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({
            filter,
            time: 300000, // 5 minutes
        });

        collector.on('collect', async i => {
            if (i.customId === 'apply_button') {
                // Create a modal for the application
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

                const modalRow1 = new ActionRowBuilder().addComponents(realNameInput);
                const modalRow2 = new ActionRowBuilder().addComponents(realAgeInput);
                const modalRow3 = new ActionRowBuilder().addComponents(characterNameInput);
                const modalRow4 = new ActionRowBuilder().addComponents(experienceInput);
                const modalRow5 = new ActionRowBuilder().addComponents(rulesInput);

                modal.addComponents(modalRow1, modalRow2, modalRow3, modalRow4, modalRow5);

                await i.showModal(modal);
            }
        });

        // Handle the modal submission
        interaction.client.on('interactionCreate', async modalInteraction => {
            if (!modalInteraction.isModalSubmit()) return;

            if (modalInteraction.customId === 'whitelist_modal') {
                const realName = modalInteraction.fields.getTextInputValue('real_name');
                const realAge = modalInteraction.fields.getTextInputValue('real_age');
                const characterName = modalInteraction.fields.getTextInputValue('character_name');
                const experience = modalInteraction.fields.getTextInputValue('experience');
                const rules = modalInteraction.fields.getTextInputValue('rules');

                const applicationEmbed = new EmbedBuilder()
                    .setColor(0x3498db)
                    .setTitle('Whitelist Application Submitted')
                    .setDescription(`**User:** <@${modalInteraction.user.id}>\n**Real Name:** ${realName}\n**Real Age:** ${realAge}\n**Character Name:** ${characterName}\n**Roleplay Experience:** ${experience}\n**Read Rules:** ${rules}`)
                    .setFooter({ text: 'Whitelist Application' })
                    .setTimestamp();

                // Send application to the designated channel
                const applicationChannel = modalInteraction.guild.channels.cache.get(applicationChannelId);
                const message = await applicationChannel.send({
                    embeds: [applicationEmbed],
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('accept')
                                .setLabel('Accept')
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setCustomId('pending')
                                .setLabel('Pending')
                                .setStyle(ButtonStyle.Secondary),
                            new ButtonBuilder()
                                .setCustomId('reject')
                                .setLabel('Reject')
                                .setStyle(ButtonStyle.Danger)
                        ),
                    ],
                });

                await modalInteraction.reply({ content: 'Your application has been submitted!', ephemeral: true });

                // Listen for button interactions on the application message
                const buttonCollector = message.createMessageComponentCollector({
                    componentType: 'BUTTON',
                    time: 86400000, // 24 hours
                });

                buttonCollector.on('collect', async buttonInteraction => {
                    await buttonInteraction.deferUpdate(); // Acknowledge the button interaction to prevent "Interaction failed."

                    const whitelistManager = buttonInteraction.user;
                    const targetUser = modalInteraction.user;

                    let role;
                    let embedColor;
                    let embedTitle;
                    let destinationChannelId;

                    if (buttonInteraction.customId === 'accept') {
                        role = acceptedRoleId;
                        embedColor = 0x00ff00;
                        embedTitle = 'Whitelist Accepted';
                        destinationChannelId = acceptChannelId;

                        // Remove pending role and add accepted role
                        await modalInteraction.guild.members.cache
                            .get(targetUser.id)
                            .roles.add(acceptedRoleId);
                        await modalInteraction.guild.members.cache
                            .get(targetUser.id)
                            .roles.remove(pendingRoleId);
                    } else if (buttonInteraction.customId === 'pending') {
                        role = pendingRoleId;
                        embedColor = 0xffa500;
                        embedTitle = 'Whitelist Pending';
                        destinationChannelId = pendingChannelId;

                        // Add pending role
                        await modalInteraction.guild.members.cache
                            .get(targetUser.id)
                            .roles.add(pendingRoleId);
                    } else if (buttonInteraction.customId === 'reject') {
                        role = rejectedRoleId;
                        embedColor = 0xff0000;
                        embedTitle = 'Whitelist Rejected';
                        destinationChannelId = rejectChannelId;
                    }

                    const resultEmbed = new EmbedBuilder()
                        .setColor(embedColor)
                        .setTitle(embedTitle)
                        .setDescription(
                            `**User:** <@${targetUser.id}>\n**Whitelist Manager:** <@${whitelistManager.id}>`
                        )
                        .setTimestamp();

                    const destinationChannel = modalInteraction.guild.channels.cache.get(destinationChannelId);
                    await destinationChannel.send({ embeds: [resultEmbed] });

                    await buttonInteraction.followUp({
                        content: `The application has been marked as **${embedTitle.toLowerCase()}**.`,
                        ephemeral: true,
                    });
                });
            }
        });
    },
};
