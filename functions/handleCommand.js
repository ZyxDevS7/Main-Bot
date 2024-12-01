require('dotenv').config();

module.exports = async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;

    // Check for required permissions (roles)
    if (command.permissions && command.permissions.length > 0) {
        const member = interaction.member;

        // Check if the member has at least one of the required roles
        const hasPermission = command.permissions.some(roleId => member.roles.cache.has(roleId));

        if (!hasPermission) {
            return interaction.reply({
                content: 'You do not have permission to use this command.',
                ephemeral: true
            });
        }
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
};
