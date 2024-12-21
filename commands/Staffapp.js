const {
    Client,
    GatewayIntentBits,
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Collection,
} = require('discord.js');
const fs = require('fs');
require('dotenv').config();

// Initialize the client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

// Load commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// Deploy commands
client.on('ready', async () => {
    const commands = [
        new SlashCommandBuilder()
            .setName('apply')
            .setDescription('Opens an application process for joining the server.')
            .toJSON(),
    ];

    await client.application.commands.set(commands);
    console.log(`Logged in as ${client.user.tag}`);
});

// Slash command handling
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'apply') {
        const announcementChannelId = '1312311823650918463'; // Replace with your announcement channel ID
        const announcementChannel = interaction.guild.channels.cache.get(announcementChannelId);

        if (announcementChannel) {
            const announcementEmbed = new EmbedBuilder()
                .setTitle('Apply Now!')
                .setDescription('Click the button below to fill out the application form.')
                .setImage('') // Replace with your image URL
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
    }

    if (interaction.isButton() && interaction.customId === 'open_application') {
        const modal = new ModalBuilder()
            .setCustomId('application_form')
            .setTitle('Application Form')
            .addComponents(
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

        await interaction.showModal(modal);
    }

    if (interaction.isModalSubmit() && interaction.customId === 'application_form') {
        const realName = interaction.fields.getTextInputValue('real_name');
        const realAge = interaction.fields.getTextInputValue('real_age');
        const roleplayExperience = interaction.fields.getTextInputValue('roleplay_experience');
        const skills = interaction.fields.getTextInputValue('skills');
        const whyJoin = interaction.fields.getTextInputValue('why_join');

        const applicationChannelId = '1320024539760955496'; // Replace with your application channel ID
        const applicationChannel = interaction.guild.channels.cache.get(applicationChannelId);

        const applicationEmbed = new EmbedBuilder()
            .setTitle('New Application')
            .addFields(
                { name: 'Real Name', value: realName },
                { name: 'Real Age', value: realAge },
                { name: 'Roleplay Experience', value: roleplayExperience },
                { name: 'Skills', value: skills },
                { name: 'Reason for Joining NRP', value: whyJoin }
            )
            .setFooter({ text: `Submitted by ${interaction.user.tag}` });

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
            content: `New application received from <@${interaction.user.id}>.`,
            embeds: [applicationEmbed],
            components: [actionRow],
        });

        await interaction.reply({ content: 'Your application has been submitted.', ephemeral: true });
    }

    if (interaction.isButton() && (interaction.customId === 'accept_application' || interaction.customId === 'reject_application')) {
        const responseChannelId = '1320024686155006055'; // Replace with your response channel ID
        const responseChannel = interaction.guild.channels.cache.get(responseChannelId);

        const applicantId = interaction.message.content.match(/<@(\d+)>/)[1];
        const applicant = await interaction.guild.members.fetch(applicantId);

        if (interaction.customId === 'accept_application') {
            await interaction.update({
                content: `Application accepted for <@${applicantId}>!`,
                components: [],
            });

            await applicant.send(`Congratulations, <@${applicantId}>! Your application to NRP has been accepted.`);
            await responseChannel.send(`Application for <@${applicantId}> has been accepted by ${interaction.user.tag}.`);
        } else if (interaction.customId === 'reject_application') {
            await interaction.update({
                content: `Application rejected for <@${applicantId}>.`,
                components: [],
            });

            await applicant.send(`We regret to inform you, <@${applicantId}>, that your application to NRP has been rejected.`);
            await responseChannel.send(`Application for <@${applicantId}> has been rejected by ${interaction.user.tag}.`);
        }
    }
});

// Login
client.login(process.env.TOKEN);
