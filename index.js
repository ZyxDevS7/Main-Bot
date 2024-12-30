const fs = require('fs');
const express = require('express');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const deployCommands = require('./functions/deployCommands');
const handleCommand = require('./functions/handleCommand');
require('dotenv').config();

// Create Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Create Express app
const app = express();
const PORT = process.env.PORT || 9028;

// Define a simple route for uptime monitoring
app.get('/', (req, res) => {
    res.send('Bot is online and running!');
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
});

// Initialize command collection
client.commands = new Collection();

// Load commands dynamically
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    try {
        const command = require(`./commands/${file}`);
        client.commands.set(command.data.name, command);
        console.log(`Loaded command: ${command.data.name}`);
    } catch (error) {
        console.error(`Error loading command ${file}:`, error);
    }
}

// Deploy commands
(async () => {
    try {
        await deployCommands(client);
        console.log('Slash commands deployed successfully.');
    } catch (error) {
        console.error('Error deploying commands:', error);
    }
})();

// Handle interactions
client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (command) await command.execute(interaction);
        } else if (interaction.isButton() || interaction.isModalSubmit()) {
            // Handle button or modal interactions
            const command = client.commands.get('whitelist'); // Update if needed
            if (command && typeof command.handleInteraction === 'function') {
                await command.handleInteraction(interaction);
            } else {
                console.error('No interaction handler found for this interaction.');
            }
        }
    } catch (error) {
        console.error('Error handling interaction:', error);
        if (interaction.isRepliable()) {
            await interaction.reply({
                content: 'An error occurred while processing your request.',
                ephemeral: true,
            });
        }
    }
});

// Log bot ready status
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// Log in to Discord
client.login(process.env.TOKEN).catch(error => {
    console.error('Failed to log in to Discord:', error);
});
