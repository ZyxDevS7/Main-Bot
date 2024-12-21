const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apply')
        .setDescription('Opens an application process for joining the server.'),
    async execute(interaction) {
        // Announce the application process in a specific channel
        const announcementChannelId = '1312311823650918463'; // Replace with your announcement channel ID
        const announcementChannel = interaction.guild.channels.cache.get(announcementChannelId);

        if (announcementChannel) {
            const announcementEmbed = new EmbedBuilder()
                .setTitle('Apply to Join!')
                .setDescription('Click the button below to fill out the application form.')
                .setFooter({ text: 'Night City' });

            const announcementButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('open_application')
                    .setLabel('Apply Now')
                    .setStyle(ButtonStyle.Primary)
            );

            await announcementChannel.send({ embeds: [announcementEmbed], components: [announcementButton] });
        }

        await interaction.reply({ content: 'The application process has been announced.', ephemeral: true });

        // Handle the button interaction
        interaction.client.on('interactionCreate', async (buttonInteraction) => {
            if (!buttonInteraction.isButton() || buttonInteraction.customId !== 'open_application') return;

            // Create and show the modal
            const modal = new ModalBuilder()
                .setCustomId('application_form')
                .setTitle('Application Form');

            modal.addComponents(
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('real_name')
                        .setLabel('What is your real name?')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('real_age')
                        .setLabel('What is your real age?')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('roleplay_experience')
                        .setLabel('What is your roleplay experience?')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('skills')
                        .setLabel('What do you know (skills)?')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                ),
                new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('why_join')
                        .setLabel('Why do you want to join NRP?')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                )
            );

            await buttonInteraction.showModal(modal);
        });

        // Handle modal submission
        interaction.client.on('interactionCreate', async (modalInteraction) => {
            if (!modalInteraction.isModalSubmit() || modalInteraction.customId !== 'application_form') return;

            // Fetch user responses
            const realName = modalInteraction.fields.getTextInputValue('real_name');
            const realAge = modalInteraction.fields.getTextInputValue('real_age');
            const roleplayExperience = modalInteraction.fields.getTextInputValue('roleplay_experience');
            const skills = modalInteraction.fields.getTextInputValue('skills');
            const whyJoin = modalInteraction.fields.getTextInputValue('why_join');

            // Acknowledge the modal interaction
            await modalInteraction.reply({
                content: 'Your application has been submitted!',
                ephemeral: true,
            });

            // Send application to the application channel
            const applicationChannelId = '1320024539760955496'; // Replace with your application channel ID
            const applicationChannel = modalInteraction.guild.channels.cache.get(applicationChannelId);

            const applicationEmbed = new EmbedBuilder()
                .setTitle('New Application Received')
                .addFields(
                    { name: 'Real Name', value: realName },
                    { name: 'Real Age', value: realAge },
                    { name: 'Roleplay Experience', value: roleplayExperience },
                    { name: 'Skills', value: skills },
                    { name: 'Why Join NRP?', value: whyJoin }
                )
                .setFooter({ text: `Submitted by ${modalInteraction.user.tag}` });

            const actionRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('accept_application')
                    .setLabel('Accept')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('reject_application')
                    .setLabel('Reject')
                    .setStyle(ButtonStyle.Danger)
            );

            await applicationChannel.send({
                content: `New application received from <@${modalInteraction.user.id}>.`,
                embeds: [applicationEmbed],
                components: [actionRow],
            });

            // Handle accept/reject buttons
            const appCollector = applicationChannel.createMessageComponentCollector({ time: 60000 });

            appCollector.on('collect', async (appInteraction) => {
                if (appInteraction.customId === 'accept_application') {
                    // Accept application
                    await appInteraction.update({
                        content: `Application accepted for <@${modalInteraction.user.id}>.`,
                        components: [],
                        embeds: [applicationEmbed.setColor('Green')],
                    });

                    await modalInteraction.user.send(
                        `Congratulations, <@${modalInteraction.user.id}>! Your application to NRP has been accepted.`
                    );

                    const responseChannelId = '1320024686155006055'; // Replace with your response channel ID
                    const responseChannel = appInteraction.guild.channels.cache.get(responseChannelId);
                    await responseChannel.send(
                        `Application for <@${modalInteraction.user.id}> has been accepted by ${appInteraction.user.tag}.`
                    );
                } else if (appInteraction.customId === 'reject_application') {
                    // Reject application
                    await appInteraction.update({
                        content: `Application rejected for <@${modalInteraction.user.id}>.`,
                        components: [],
                        embeds: [applicationEmbed.setColor('Red')],
                    });

                    await modalInteraction.user.send(
                        `We regret to inform you, <@${modalInteraction.user.id}>, that your application to NRP has been rejected.`
                    );

                    const responseChannelId = '1320024686155006055'; // Replace with your response channel ID
                    const responseChannel = appInteraction.guild.channels.cache.get(responseChannelId);
                    await responseChannel.send(
                        `Application for <@${modalInteraction.user.id}> has been rejected by ${appInteraction.user.tag}.`
                    );
                }
            });
        });
    },
};
