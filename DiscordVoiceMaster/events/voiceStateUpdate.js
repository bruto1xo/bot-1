const { ChannelType, PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const { createControlPanel } = require('../utils/embedBuilder');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState, client) {
        const member = newState.member;
        const guild = newState.guild;

        // User joined the trigger channel
        if (newState.channelId === config.TRIGGER_CHANNEL_ID && !oldState.channelId) {
            try {
                // Create temporary voice channel
                const tempChannel = await guild.channels.create({
                    name: `${member.displayName}'s Channel`,
                    type: ChannelType.GuildVoice,
                    parent: config.TEMP_CATEGORY_ID,
                    userLimit: config.DEFAULT_CHANNEL_LIMIT,
                    permissionOverwrites: [
                        {
                            id: member.id,
                            allow: [
                                PermissionFlagsBits.ManageChannels,
                                PermissionFlagsBits.ManageRoles,
                                PermissionFlagsBits.MoveMembers,
                                PermissionFlagsBits.MuteMembers,
                                PermissionFlagsBits.DeafenMembers
                            ]
                        },
                        {
                            id: guild.roles.everyone.id,
                            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
                        }
                    ]
                });

                // Move user to the new channel
                await member.voice.setChannel(tempChannel);

                // Store temp channel data
                client.tempChannels.set(tempChannel.id, {
                    ownerId: member.id,
                    createdAt: Date.now(),
                    locked: false,
                    chatLocked: false,
                    status: null
                });

                client.channelOwners.set(member.id, tempChannel.id);

                // Send control panel
                const controlPanel = createControlPanel(member, tempChannel);
                await tempChannel.send({ embeds: [controlPanel.embed], components: [controlPanel.actionRow, controlPanel.actionRow2] });

                console.log(`Created temp channel for ${member.displayName}`);

            } catch (error) {
                console.error('Error creating temp channel:', error);
            }
        }

        // Check if temp channel is now empty
        if (oldState.channel && client.tempChannels.has(oldState.channelId)) {
            const channel = oldState.channel;
            
            // Wait a moment then check if channel is empty
            setTimeout(async () => {
                try {
                    const updatedChannel = await guild.channels.fetch(channel.id);
                    if (updatedChannel && updatedChannel.members.size === 0) {
                        // Clean up data
                        const channelData = client.tempChannels.get(channel.id);
                        if (channelData) {
                            client.channelOwners.delete(channelData.ownerId);
                            client.tempChannels.delete(channel.id);
                        }
                        
                        // Delete the channel
                        await updatedChannel.delete('Temporary channel empty');
                        console.log(`Deleted empty temp channel: ${updatedChannel.name}`);
                    }
                } catch (error) {
                    // Channel might already be deleted
                    console.log('Channel cleanup completed or channel already deleted');
                }
            }, config.CLEANUP_DELAY);
        }
    }
};
