const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('apply')
        .setDescription('Opens an application process for joining the server.'),
    async execute(interaction) {
        // Create an embed with an image and a button
        const embed = new EmbedBuilder()
            .setTitle('Apply to Join NRP')
            .setDescription('Click the button below to fill out the application form.')
            .setImage('https://r2.fivemanage.com/M8ZRs0ZKRHQNYpT5YIztc/SCTFORu.gif') // Replace with your actual image URL
            .setFooter({ text: 'Night City' });

        const button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('open_application')
                .setLabel('Apply Now')
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({ embeds: [embed], components: [button], ephemeral: true });

        // Handle button interaction
        const collector = interaction.channel.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'open_application') {
                // Create a modal for questions
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
                            .setLabel('Why do you like to join NRP?')
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                    )
                );

                await i.showModal(modal);
            }
        });

        interaction.client.on('interactionCreate', async modalInteraction => {
            if (!modalInteraction.isModalSubmit()) return;
            if (modalInteraction.customId === 'application_form') {
                // Fetch user responses
                const realName = modalInteraction.fields.getTextInputValue('real_name');
                const realAge = modalInteraction.fields.getTextInputValue('real_age');
                const roleplayExperience = modalInteraction.fields.getTextInputValue('roleplay_experience');
                const skills = modalInteraction.fields.getTextInputValue('skills');
                const whyJoin = modalInteraction.fields.getTextInputValue('why_join');

                const applicationChannelId = '1320024539760955496'; // Replace with your channel ID
                const applicationChannel = modalInteraction.guild.channels.cache.get(applicationChannelId);

                const applicationEmbed = new EmbedBuilder()
                    .setTitle('New Application Received')
                    .addFields(
                        { name: 'Real Name', value: realName },
                        { name: 'Real Age', value: realAge },
                        { name: 'Roleplay Experience', value: roleplayExperience },
                        { name: 'Skills', value: skills },
                        { name: 'Reason for Joining NRP', value: whyJoin }
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

                await applicationChannel.send({ embeds: [applicationEmbed], components: [actionRow] });

                await modalInteraction.reply({ content: 'Your application has been submitted.', ephemeral: true });

                const appCollector = applicationChannel.createMessageComponentCollector({ time: 60000 });

                appCollector.on('collect', async appInteraction => {
                    const responseChannelId = '1320024686155006055'; // Replace with your response channel ID
                    const responseChannel = appInteraction.guild.channels.cache.get(responseChannelId);

                    if (appInteraction.customId === 'accept_application') {
                        await appInteraction.update({
                            content: 'Application accepted!',
                            components: [],
                            embeds: [applicationEmbed.setColor('Green')],
                        });

                        await modalInteraction.user.send('Congratulations! Your application to NRP has been accepted.');
                        await responseChannel.send(`${modalInteraction.user.tag}'s application has been accepted.`);
                    } else if (appInteraction.customId === 'reject_application') {
                        await appInteraction.update({
                            content: 'Application rejected.',
                            components: [],
                            embeds: [applicationEmbed.setColor('Red')],
                        });

                        await modalInteraction.user.send('We regret to inform you that your application to NRP has been rejected.');
                        await responseChannel.send(`${modalInteraction.user.tag}'s application has been rejected.`);
                    }
                });
            }
        });
    }
};
