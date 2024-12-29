const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    InteractionType,
} = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setwlapplication')
        .setDescription('Send a whitelist application message with Apply button.'),
    async execute(interaction) {
        const applicationReceiveChannelId = '1320024539760955496'; // Replace with your application receive channel ID
        const pendingChannelId = '1322798711050342470'; // Replace with your pending applications channel ID
        const rejectedChannelId = '1322798746030964809'; // Replace with your rejected applications channel ID
        const applicationImageURL = 'https://i.ibb.co/yQD3pwL/nrp-rejected.png'; // Replace with the application image URL
        const pendingImageURL = 'https://i.ibb.co/yQD3pwL/nrp-rejected.png'; // Replace with the pending image URL
        const rejectImageURL = 'https://i.ibb.co/yQD3pwL/nrp-rejected.png'; // Replace with the reject image URL

        // Send an embed with the "Apply" button
        const embed = new EmbedBuilder()
            .setTitle('Whitelist Application')
            .setDescription('Click "Apply" to start the application process.')
            .setImage(applicationImageURL)
            .setColor(0x00ff00);

        const actionRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('apply_button')
                .setLabel('Apply')
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({
            embeds: [embed],
            components: [actionRow],
            ephemeral: false,
        });

        const collector = interaction.channel.createMessageComponentCollector({
            componentType: 'BUTTON',
            time: 600000,
        });

        collector.on('collect', async (buttonInteraction) => {
            if (buttonInteraction.customId === 'apply_button') {
                const modal = new ModalBuilder()
                    .setCustomId('wl_application_modal')
                    .setTitle('Whitelist Application');

                const nameInput = new TextInputBuilder()
                    .setCustomId('real_name')
                    .setLabel('Real Name')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const ageInput = new TextInputBuilder()
                    .setCustomId('real_age')
                    .setLabel('Real Age')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const characterNameInput = new TextInputBuilder()
                    .setCustomId('character_name')
                    .setLabel('Character Name')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const experienceInput = new TextInputBuilder()
                    .setCustomId('rp_experience')
                    .setLabel('Roleplay Experience')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true);

                const rulesInput = new TextInputBuilder()
                    .setCustomId('read_rules')
                    .setLabel('Did you read the rules? (Yes/No)')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(nameInput),
                    new ActionRowBuilder().addComponents(ageInput),
                    new ActionRowBuilder().addComponents(characterNameInput),
                    new ActionRowBuilder().addComponents(experienceInput),
                    new ActionRowBuilder().addComponents(rulesInput)
                );

                await buttonInteraction.showModal(modal);
            }
        });

        interaction.client.on('interactionCreate', async (modalInteraction) => {
            if (modalInteraction.type === InteractionType.ModalSubmit && modalInteraction.customId === 'wl_application_modal') {
                const realName = modalInteraction.fields.getTextInputValue('real_name');
                const realAge = modalInteraction.fields.getTextInputValue('real_age');
                const characterName = modalInteraction.fields.getTextInputValue('character_name');
                const rpExperience = modalInteraction.fields.getTextInputValue('rp_experience');
                const readRules = modalInteraction.fields.getTextInputValue('read_rules');

                const applicationEmbed = new EmbedBuilder()
                    .setTitle('New Whitelist Application')
                    .setDescription(`**Applicant**: <@${modalInteraction.user.id}>`)
                    .addFields(
                        { name: 'Real Name', value: realName, inline: true },
                        { name: 'Real Age', value: realAge, inline: true },
                        { name: 'Character Name', value: characterName, inline: true },
                        { name: 'Roleplay Experience', value: rpExperience },
                        { name: 'Read Rules', value: readRules }
                    )
                    .setFooter({ text: `Application ID: ${modalInteraction.user.id}` })
                    .setTimestamp();

                const actionRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('pending_application')
                        .setLabel('Pending')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('reject_application')
                        .setLabel('Reject')
                        .setStyle(ButtonStyle.Danger)
                );

                const applicationChannel = modalInteraction.guild.channels.cache.get(applicationReceiveChannelId);

                if (applicationChannel) {
                    await applicationChannel.send({
                        embeds: [applicationEmbed],
                        components: [actionRow],
                    });

                    await modalInteraction.reply({
                        content: 'Your application has been submitted successfully!',
                        ephemeral: true,
                    });
                }
            }
        });

        interaction.client.on('interactionCreate', async (buttonInteraction) => {
            if (buttonInteraction.isButton()) {
                const applicantId = buttonInteraction.message.embeds[0].footer.text.split(': ')[1];
                const applicant = await interaction.guild.members.fetch(applicantId);

                if (buttonInteraction.customId === 'pending_application') {
                    const flightNumber = `WL${Math.floor(Math.random() * 90000) + 10000}`;
                    const gate = `G${Math.floor(Math.random() * 10) + 1}`;
                    const seatNumber = `${Math.floor(Math.random() * 30) + 1}${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`;

                    const embed = new EmbedBuilder()
                        .setTitle('Whitelist Application Approved')
                        .setDescription(`<@${applicantId}>, your application has been approved.`)
                        .addFields(
                            { name: 'Flight Number', value: flightNumber },
                            { name: 'Gate', value: gate },
                            { name: 'Seat', value: seatNumber },
                            { name: 'Date', value: new Date().toLocaleDateString() }
                        )
                        .setImage(pendingImageURL)
                        .setColor(0x00ff00);

                    const pendingChannel = interaction.guild.channels.cache.get(pendingChannelId);
                    await pendingChannel.send({ embeds: [embed] });

                    await buttonInteraction.reply({
                        content: `Application has been approved for <@${applicantId}>.`,
                        ephemeral: true,
                    });
                } else if (buttonInteraction.customId === 'reject_application') {
                    const embed = new EmbedBuilder()
                        .setTitle('Whitelist Application Rejected')
                        .setDescription(`<@${applicantId}>, your application has been rejected.`)
                        .setImage(rejectImageURL)
                        .setColor(0xff0000);

                    const rejectedChannel = interaction.guild.channels.cache.get(rejectedChannelId);
                    await rejectedChannel.send({ embeds: [embed] });

                    await buttonInteraction.reply({
                        content: `Application has been rejected for <@${applicantId}>.`,
                        ephemeral: true,
                    });
                }
            }
        });
    },
};
                  
