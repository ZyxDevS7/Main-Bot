const fs = require('fs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const deployCommands = require('./functions/deployCommands');
const handleCommand = require('./functions/handleCommand');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

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
