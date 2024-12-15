const fs = require('fs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const deployCommands = require('./functions/deployCommands');
const handleCommand = require('./functions/handleCommand');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const express = require('express');
const app = express();

// Define a simple route for uptime monitoring
app.get('/', (req, res) => {
    res.send('Bot is online and running!');
});

// Start the Express server
const PORT = 9028; // Port number
app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});

client.commands = new Collection();

// Load commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

// Deploy commands
deployCommands(client);

// Handle interactions
client.on('interactionCreate', async interaction => {
    await handleCommand(interaction);
});

// Log in
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);
