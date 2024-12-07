const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const moment = require('moment-timezone');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user for a specified period.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to ban.')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('The reason for the ban.')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('period')
                .setDescription('The duration of the ban (e.g., 2days, 5hours).')
                .setRequired(true)),
    permissions: [
        process.env.ADMIN_ROLE,
        process.env.MODERATOR_ROLE
    ],
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const period = interaction.options.getString('period');
        const bannedRoleId = '1314202753458896906'; // Replace with the banned role ID
        const targetChannelId = '1314202624060297338'; // Replace with the target channel ID

        // Parse the ban duration
        const now = moment();
        const banEnd = now.clone().add(moment.duration(period)); // Parses "2days" or "5hours"
        const formattedEnd = banEnd.format('YYYY-MM-DD HH:mm:ss');

        // Assign the banned role
        const guildMember = await interaction.guild.members.fetch(user.id);
        if (!guildMember) {
            return interaction.reply({
                content: 'Could not fetch the user. Please ensure they are in the server.',
                ephemeral: true
            });
        }

        await guildMember.roles.add(bannedRoleId);

        // Generate custom image with canvas
        const canvas = createCanvas(700, 250);
        const ctx = canvas.getContext('2d');

        // Background
        const background = await loadImage('https://www.imghippo.com/i/fXSJ4736zg.png'); // Replace with your image URL
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // Add text
        ctx.font = '30px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Player Banned', 50, 50);
        ctx.fillText(`User: ${user.tag}`, 50, 100);
        ctx.fillText(`Reason: ${reason}`, 50, 150);
        ctx.fillText(`Ban Ends: ${formattedEnd}`, 50, 200);

        // Save the image to a buffer
        const buffer = canvas.toBuffer('image/png');
        const attachment = new AttachmentBuilder(buffer, { name: 'ban.png' });

        // Create embed
        const embed = new EmbedBuilder()
            .setTitle('🚫 PLAYER BANNED')
            .setColor('#ff0000')
            .setDescription(`User: ${user}\nReason: ${reason}\nBan Period: ${period}\nBan Ends: <t:${Math.floor(banEnd.unix())}:F>`)
            .setThumbnail(user.displayAvatarURL())
            .setImage('attachment://ban.png') // The generated image will appear here
            .setFooter({
                text: 'By Nee Ko Njaa Cha Management',
                iconURL: interaction.client.user.displayAvatarURL()
            });

        // Send embed with the image attachment
        const targetChannel = interaction.guild.channels.cache.get(targetChannelId);
        if (!targetChannel) {
            return interaction.reply({
                content: 'Could not find the target channel. Please check the channel ID.',
                ephemeral: true
            });
        }

        await targetChannel.send({
            content: `${user}`,
            embeds: [embed],
            files: [attachment]
        });

        // Acknowledge the command
        await interaction.reply({
            content: `Successfully banned ${user.tag} for ${period}.`,
            ephemeral: true
        });
    },
};
