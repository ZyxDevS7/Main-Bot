const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

// Discord bot setup
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// YouTube channels to monitor
const YOUTUBE_CHANNELS = [
    { id: 'UC_x5XG1OV2P6uZZ5FSM9Ttw', name: 'Google Developers' }, // Replace with channel ID and name
    { id: 'UC29ju8bIPH5as8OGnQzwJyA', name: 'Traversy Media' },    // Replace with channel ID and name
];

// Discord channel ID where notifications will be sent
const DISCORD_CHANNEL_ID = '1322428122519441540'; // Replace with your channel ID

// YouTube API key
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Track live streams to avoid duplicate notifications
let liveStreams = new Set();

async function checkLiveStreams() {
    for (const ytChannel of YOUTUBE_CHANNELS) {
        try {
            const response = await axios.get(
                `https://www.googleapis.com/youtube/v3/search`,
                {
                    params: {
                        part: 'snippet',
                        channelId: ytChannel.id,
                        eventType: 'live',
                        type: 'video',
                        key: YOUTUBE_API_KEY,
                    },
                }
            );

            const liveData = response.data.items;

            if (liveData.length > 0) {
                const stream = liveData[0];
                const videoId = stream.id.videoId;
                const streamTitle = stream.snippet.title;

                if (!liveStreams.has(videoId)) {
                    liveStreams.add(videoId);

                    // Send live notification to Discord
                    const discordChannel = client.channels.cache.get(DISCORD_CHANNEL_ID);
                    if (discordChannel) {
                        const embed = new EmbedBuilder()
                            .setColor(0xff0000) // Red color for YouTube
                            .setTitle(`${ytChannel.name} is now live!`)
                            .setDescription(`[${streamTitle}](https://www.youtube.com/watch?v=${videoId})`)
                            .setImage(stream.snippet.thumbnails.high.url)
                            .setFooter({ text: 'YouTube Live Notification' });

                        await discordChannel.send({ embeds: [embed] });
                    }
                }
            } else {
                console.log(`No live streams found for channel: ${ytChannel.name}`);
            }
        } catch (error) {
            console.error(`Error fetching live streams for channel ${ytChannel.name}:`, error.message);
        }
    }
}

// Check for live streams every 5 minutes
setInterval(checkLiveStreams, 5 * 60 * 1000);

// Bot login
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.TOKEN);
