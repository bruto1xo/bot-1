const { ChannelType, PermissionFlagsBits, MessageFlags } = require('discord.js');
const { createControlPanel, createHelpEmbed } = require('../utils/embedBuilder');
const channelManager = require('../utils/channelManager');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isButton()) return;

        const member = interaction.member;
        const channel = interaction.channel;

        // Check if this is a temp channel
        if (!client.tempChannels.has(channel.id)) {
            return interaction.reply({ content: 'This is not a temporary voice channel!', flags: MessageFlags.Ephemeral });
        }

        const channelData = client.tempChannels.get(channel.id);

        // Check if user is the channel owner
        if (channelData.ownerId !== member.id) {
            return interaction.reply({ content: 'Only the channel owner can use these controls!', flags: MessageFlags.Ephemeral });
        }

        try {
            switch (interaction.customId) {
                case 'lock_channel':
                    await channelManager.lockChannel(channel, client);
                    await interaction.reply({ content: '🔒 Channel locked! Only permitted users can join.', flags: MessageFlags.Ephemeral });
                    break;

                case 'unlock_channel':
                    await channelManager.unlockChannel(channel, client);
                    await interaction.reply({ content: '🔓 Channel unlocked! Anyone can join.', flags: MessageFlags.Ephemeral });
                    break;

                case 'limit_channel':
                    await interaction.reply({ 
                        content: 'Please use the command `.v limit <number>` to set the user limit (1-99)', 
                        flags: MessageFlags.Ephemeral 
                    });
                    break;

                case 'rename_channel':
                    await interaction.reply({ 
                        content: 'Please use the command `.v rename <new name>` to rename the channel', 
                        flags: MessageFlags.Ephemeral 
                    });
                    break;

                case 'set_status':
                    await interaction.reply({ 
                        content: 'Please use the command `.v setstatus <status>` to set the channel status', 
                        flags: MessageFlags.Ephemeral 
                    });
                    break;

                case 'permit_user':
                    await interaction.reply({ 
                        content: 'Please use the command `.v permit @user` to permit a user to join', 
                        flags: MessageFlags.Ephemeral 
                    });
                    break;

                case 'reject_user':
                    await interaction.reply({ 
                        content: 'Please use the command `.v reject @user` to reject a user from joining', 
                        flags: MessageFlags.Ephemeral 
                    });
                    break;

                case 'lock_chat':
                    await channelManager.lockChat(channel, client);
                    await interaction.reply({ content: '💬🔒 Chat locked! Only you can send messages.', flags: MessageFlags.Ephemeral });
                    break;

                case 'unlock_chat':
                    await channelManager.unlockChat(channel, client);
                    await interaction.reply({ content: '💬🔓 Chat unlocked! Everyone can send messages.', flags: MessageFlags.Ephemeral });
                    break;

                case 'help_panel':
                    const helpEmbed = createHelpEmbed();
                    await interaction.reply({ embeds: [helpEmbed], flags: MessageFlags.Ephemeral });
                    break;

                default:
                    await interaction.reply({ content: 'Unknown action!', flags: MessageFlags.Ephemeral });
            }
        } catch (error) {
            console.error('Error handling button interaction:', error);
            await interaction.reply({ content: 'An error occurred while processing your request!', flags: MessageFlags.Ephemeral });
        }
    }
};
