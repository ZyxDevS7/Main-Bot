const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
} = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setwlapplication')
        .setDescription('Send the whitelist application message with the Apply button.'),
    async execute(interaction) {
        // Hardcoded settings
        const applicationChannelId = '1320024539760955496'; // Replace with the channel ID for receiving applications
        const responseChannelId = '1320024686155006055'; // Replace with the channel ID for sending responses
        const imageUrl = 'https://i.ibb.co/yQD3pwL/nrp-rejected.png'; // Replace with your custom image URL

        // Create and send the application message
        const embed = new EmbedBuilder()
            .setTitle('Whitelist Application')
            .setDescription('Click **Apply** to start your whitelist application.')
            .setImage(imageUrl)
            .setColor(0x00ff00);

        const applyButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('apply')
                .setLabel('Apply')
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.channel.send({
            embeds: [embed],
            components: [applyButton],
        });

        await interaction.reply({ content: 'Whitelist application message sent!', ephemeral: true });

        // Listener for button interactions
        interaction.client.on('interactionCreate', async interaction => {
            if (interaction.isButton() && interaction.customId === 'apply') {
                const modal = new ModalBuilder()
                    .setCustomId('whitelistApplication')
                    .setTitle('Whitelist Application');

                // Questions
                const questions = [
                    { id: 'realName', label: 'Real Name', style: TextInputStyle.Short },
                    { id: 'realAge', label: 'Real Age', style: TextInputStyle.Short },
                    { id: 'characterName', label: 'Character Name', style: TextInputStyle.Short },
                    { id: 'rpExperience', label: 'Roleplay Experience', style: TextInputStyle.Paragraph },
                    { id: 'readRules', label: 'Did you read the rules? (Yes/No)', style: TextInputStyle.Short },
                ];

                // Add inputs to modal
                questions.forEach(question => {
                    modal.addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId(question.id)
                                .setLabel(question.label)
                                .setStyle(question.style)
                        )
                    );
                });

                await interaction.showModal(modal);
            } else if (interaction.isModalSubmit() && interaction.customId === 'whitelistApplication') {
                // Collect responses
                const realName = interaction.fields.getTextInputValue('realName');
                const realAge = interaction.fields.getTextInputValue('realAge');
                const characterName = interaction.fields.getTextInputValue('characterName');
                const rpExperience = interaction.fields.getTextInputValue('rpExperience');
                const readRules = interaction.fields.getTextInputValue('readRules');

                // Send application to the specified channel
                const appEmbed = new EmbedBuilder()
                    .setTitle('New Whitelist Application')
                    .setDescription(`An application has been submitted.`)
                    .addFields(
                        { name: 'Real Name', value: realName, inline: true },
                        { name: 'Real Age', value: realAge, inline: true },
                        { name: 'Character Name', value: characterName, inline: true },
                        { name: 'Roleplay Experience', value: rpExperience, inline: false },
                        { name: 'Read Rules', value: readRules, inline: true }
                    )
                    .setFooter({ text: `Application from ${interaction.user.tag}` })
                    .setColor(0x0099ff);

                const channel = interaction.client.channels.cache.get(applicationChannelId);
                const pendingButtons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('accept')
                        .setLabel('Accept')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('reject')
                        .setLabel('Reject')
                        .setStyle(ButtonStyle.Danger)
                );

                const appMessage = await channel.send({
                    content: `<@${interaction.user.id}>`,
                    embeds: [appEmbed],
                    components: [pendingButtons],
                });

                await interaction.reply({ content: 'Your application has been submitted!', ephemeral: true });

                // Handle accept/reject buttons
                const filter = i =>
                    i.customId === 'accept' || i.customId === 'reject';
                const collector = appMessage.createMessageComponentCollector({ filter, max: 1 });

                collector.on('collect', async buttonInteraction => {
                    if (buttonInteraction.customId === 'accept') {
                        // Generate custom image with canvas
                        const canvas = createCanvas(700, 400);
                        const ctx = canvas.getContext('2d');
                        const background = await loadImage(imageUrl);

                        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

                        ctx.font = '28px Arial';
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText(`Name: ${realName}`, 50, 100);
                        ctx.fillText(`Flight No: RP-${Math.floor(1000 + Math.random() * 9000)}`, 50, 150);
                        ctx.fillText(`Gate: ${Math.floor(1 + Math.random() * 10)}`, 50, 200);
                        ctx.fillText(`Seat: ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}${Math.floor(1 + Math.random() * 30)}`, 50, 250);
                        ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, 50, 300);

                        const buffer = canvas.toBuffer('image/png');
                        const filePath = './response.png';
                        fs.writeFileSync(filePath, buffer);

                        const responseChannel = interaction.client.channels.cache.get(responseChannelId);
                        await responseChannel.send({
                            content: `<@${interaction.user.id}>, your application has been **accepted**!`,
                            files: [filePath],
                        });
                        await buttonInteraction.reply({ content: 'Application accepted and response sent.', ephemeral: true });
                    } else if (buttonInteraction.customId === 'reject') {
                        const responseChannel = interaction.client.channels.cache.get(responseChannelId);
                        await responseChannel.send({
                            content: `<@${interaction.user.id}>, your application has been **rejected**.`,
                        });
                        await buttonInteraction.reply({ content: 'Application rejected and response sent.', ephemeral: true });
                    }
                });
            }
        });
    },
};
