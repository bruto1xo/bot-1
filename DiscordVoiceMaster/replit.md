# Discord Temporary Voice Channel Bot

## Overview

This is a Discord bot that creates temporary voice channels on demand. When users join a designated trigger channel, the bot automatically creates a private voice channel for them with full management controls. The system provides channel owners with comprehensive tools to manage their temporary channels, including locking/unlocking, setting user limits, renaming, and controlling access permissions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Bot Framework
- **Discord.js v14**: Primary framework for Discord API interactions
- **Event-driven architecture**: Uses Discord.js event system for real-time voice state monitoring
- **Command system**: Prefix-based commands with `.v` prefix for voice channel management
- **Button interactions**: Interactive control panel using Discord's button components

### Core Components

#### Voice Channel Management System
- **Trigger-based creation**: Monitors specific voice channel for user joins to create temporary channels
- **Automatic cleanup**: Removes empty temporary channels after users leave
- **Owner permissions**: Grants channel creators elevated permissions for management
- **Permission overrides**: Dynamically manages channel permissions for access control

#### Command Structure
- **Modular command loading**: Commands stored in separate files and loaded dynamically
- **Cooldown system**: Prevents command spam with configurable delays
- **Permission validation**: Ensures only channel owners can manage their channels
- **Subcommand routing**: Single `voice` command with multiple subcommands (lock, unlock, limit, rename, etc.)

#### State Management
- **In-memory collections**: Uses Discord.js Collections to track temporary channels and ownership
- **Channel metadata**: Stores creation time, owner ID, lock status, and other channel properties
- **No persistent storage**: All data is ephemeral and recreated on bot restart

#### Event Handling System
- **Voice state monitoring**: Tracks user joins/leaves to manage channel lifecycle
- **Interaction processing**: Handles button clicks for the control panel interface
- **Message command parsing**: Processes prefix commands for text-based management

### Data Flow Architecture

#### Channel Creation Flow
1. User joins trigger channel → Voice state update event fired
2. Bot creates new temporary channel in designated category
3. User automatically moved to new channel
4. Channel metadata stored in memory collections
5. Control panel sent to channel for management

#### Channel Management Flow
1. Owner uses command or button → Permission validation
2. Action executed (lock/unlock/rename/etc.)
3. Channel state updated in memory
4. Discord permissions modified accordingly
5. Confirmation sent to user

#### Cleanup Process
- Monitors voice state changes for empty channels
- Automatically deletes temporary channels when all users leave
- Cleans up associated metadata from memory collections

## External Dependencies

### Core Dependencies
- **discord.js (^14.21.0)**: Primary Discord API wrapper library
- **dotenv**: Environment variable management for configuration
- **Node.js built-ins**: File system and path utilities for dynamic loading

### Discord API Integration
- **Gateway intents**: Guilds, GuildVoiceStates, GuildMessages, MessageContent
- **Permission system**: Uses Discord's permission overwrites for access control
- **Channel management**: Creates/deletes voice channels dynamically
- **User interaction**: Button components and message commands

### Configuration System
- **Environment variables**: Bot token and channel IDs stored in .env file
- **Static configuration**: Default values, colors, and settings in config.js
- **Runtime configuration**: Channel limits and cleanup delays configurable

### No External Services
- **No database**: All data stored in memory (ephemeral)
- **No external APIs**: Only Discord API integration
- **No file storage**: No persistent data or file operations beyond code loading