const { PermissionFlagsBits } = require('discord.js');
const channelManager = require('../utils/channelManager');
const { createControlPanel, createHelpEmbed, createSuccessEmbed, createErrorEmbed } = require('../utils/embedBuilder');

module.exports = {
    name: 'voice',
    aliases: ['v'],
    description: 'Voice channel management commands',
    cooldown: 2,
    async execute(message, args, client) {
        const subcommand = args[0]?.toLowerCase();
        const channel = message.member.voice.channel;

        // Check if user is in a voice channel
        if (!channel) {
            const errorEmbed = createErrorEmbed('You must be in a voice channel to use this command!');
            return message.reply({ embeds: [errorEmbed] });
        }

        // Check if it's a temp channel
        if (!client.tempChannels.has(channel.id)) {
            const errorEmbed = createErrorEmbed('This command can only be used in temporary voice channels!');
            return message.reply({ embeds: [errorEmbed] });
        }

        const channelData = client.tempChannels.get(channel.id);

        // Check if user is the channel owner
        if (channelData.ownerId !== message.author.id) {
            const errorEmbed = createErrorEmbed('Only the channel owner can use these commands!');
            return message.reply({ embeds: [errorEmbed] });
        }

        try {
            switch (subcommand) {
                case 'lock':
                    await channelManager.lockChannel(channel, client);
                    const lockEmbed = createSuccessEmbed('🔒 Channel locked! Only permitted users can join.');
                    await message.reply({ embeds: [lockEmbed] });
                    break;

                case 'unlock':
                    await channelManager.unlockChannel(channel, client);
                    const unlockEmbed = createSuccessEmbed('🔓 Channel unlocked! Anyone can join.');
                    await message.reply({ embeds: [unlockEmbed] });
                    break;

                case 'limit':
                    const limit = parseInt(args[1]);
                    if (!limit || limit < 1 || limit > 99) {
                        const errorEmbed = createErrorEmbed('Please provide a valid limit between 1 and 99!');
                        return message.reply({ embeds: [errorEmbed] });
                    }
                    await channel.setUserLimit(limit);
                    const limitEmbed = createSuccessEmbed(`👥 Channel limit set to ${limit} users.`);
                    await message.reply({ embeds: [limitEmbed] });
                    break;

                case 'rename':
                    const newName = args.slice(1).join(' ');
                    if (!newName || newName.length > 100) {
                        const errorEmbed = createErrorEmbed('Please provide a valid name (max 100 characters)!');
                        return message.reply({ embeds: [errorEmbed] });
                    }
                    await channel.setName(newName);
                    const renameEmbed = createSuccessEmbed(`✏️ Channel renamed to "${newName}".`);
                    await message.reply({ embeds: [renameEmbed] });
                    break;

                case 'setstatus':
                    const status = args.slice(1).join(' ');
                    if (!status || status.length > 500) {
                        const errorEmbed = createErrorEmbed('Please provide a valid status (max 500 characters)!');
                        return message.reply({ embeds: [errorEmbed] });
                    }
                    await channel.setRTCRegion(null); // Discord API limitation workaround
                    channelData.status = status;
                    client.tempChannels.set(channel.id, channelData);
                    const statusEmbed = createSuccessEmbed(`📝 Channel status set to: "${status}"`);
                    await message.reply({ embeds: [statusEmbed] });
                    break;

                case 'permit':
                    const userToPermit = message.mentions.users.first();
                    if (!userToPermit) {
                        const errorEmbed = createErrorEmbed('Please mention a user to permit!');
                        return message.reply({ embeds: [errorEmbed] });
                    }
                    await channelManager.permitUser(channel, userToPermit.id);
                    const permitEmbed = createSuccessEmbed(`✅ ${userToPermit.username} has been permitted to join the channel.`);
                    await message.reply({ embeds: [permitEmbed] });
                    break;

                case 'reject':
                    const userToReject = message.mentions.users.first();
                    if (!userToReject) {
                        const errorEmbed = createErrorEmbed('Please mention a user to reject!');
                        return message.reply({ embeds: [errorEmbed] });
                    }
                    await channelManager.rejectUser(channel, userToReject.id, message.guild);
                    const rejectEmbed = createSuccessEmbed(`❌ ${userToReject.username} has been rejected from the channel.`);
                    await message.reply({ embeds: [rejectEmbed] });
                    break;

                case 'lockchat':
                    await channelManager.lockChat(channel, client);
                    const lockChatEmbed = createSuccessEmbed('💬🔒 Chat locked! Only you can send messages.');
                    await message.reply({ embeds: [lockChatEmbed] });
                    break;

                case 'unlockchat':
                    await channelManager.unlockChat(channel, client);
                    const unlockChatEmbed = createSuccessEmbed('💬🔓 Chat unlocked! Everyone can send messages.');
                    await message.reply({ embeds: [unlockChatEmbed] });
                    break;

                case 'panel':
                    const controlPanel = createControlPanel(message.member, channel);
                    await message.reply({ embeds: [controlPanel.embed], components: [controlPanel.actionRow, controlPanel.actionRow2] });
                    break;

                case 'help':
                    const helpEmbed = createHelpEmbed();
                    await message.reply({ embeds: [helpEmbed] });
                    break;

                default:
                    const unknownEmbed = createErrorEmbed('Unknown command! Use `.v help` to see available commands.');
                    await message.reply({ embeds: [unknownEmbed] });
            }
        } catch (error) {
            console.error('Error executing voice command:', error);
            const errorEmbed = createErrorEmbed('An error occurred while executing the command!');
            await message.reply({ embeds: [errorEmbed] });
        }
    }
};
