import { serialize, decodeJid } from '../lib/Serializer.js';
import path from 'path';
import fs from 'fs/promises';
import config from '../config.cjs';
import { handleAntilink } from './antilink.js';
import { fileURLToPath, pathToFileURL } from 'url';
import { getCommand } from '../command.js';
import pkg from '../lib/autoreact.cjs';
const { doReact } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get group admins helper
export const getGroupAdmins = (participants) => {
    let admins = [];
    for (let i of participants) {
        if (i.admin === "superadmin" || i.admin === "admin") {
            admins.push(i.id);
        }
    }
    return admins || [];
};

const Handler = async (chatUpdate, sock, logger) => {
    try {
        if (chatUpdate.type !== 'notify') return;

        // Serialize incoming message
        const m = serialize(JSON.parse(JSON.stringify(chatUpdate.messages[0])), sock, logger);
        if (!m.message) return;

        // Get group participants and admins if in group
        const participants = m.isGroup ? (await sock.groupMetadata(m.from)).participants : [];
        const groupAdmins = m.isGroup ? getGroupAdmins(participants) : [];

        // Decode bot ID and owner number
        const botId = decodeJid(sock.user.id);
        const ownerNumber = config.OWNER_NUMBER + '@s.whatsapp.net';

        // Check admin statuses
        const isBotAdmins = m.isGroup ? groupAdmins.includes(botId) : false;
        const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false;

        // Creator check: owner always creator, bot is creator only in groups
        const isCreator = m.sender === ownerNumber || (m.isGroup && m.sender === botId);

        // Command prefix and parsing
        const PREFIX = config.PREFIX || '.';
        const isCOMMAND = (body) => typeof body === 'string' && body.startsWith(PREFIX);
        const cmd = isCOMMAND(m.body) ? m.body.slice(PREFIX.length).split(" ")[0].toLowerCase() : "";
        const text = isCOMMAND(m.body) ? m.body.slice(PREFIX.length + cmd.length).trim() : "";

        // Ignore if bot is in private mode and sender is not creator
        if (!sock.public && !isCreator) return;

        // Handle antilink protection (if implemented)
        await handleAntilink(m, sock, logger, isBotAdmins, isAdmins, isCreator);

        const { from, sender } = m;

        // Try to find and run classic commands (.js or .cjs)
        const foundCmd = getCommand(PREFIX + cmd);
        if (foundCmd && typeof foundCmd.handler === 'function') {
            try {
                // Auto react emoji if specified
                if (foundCmd.react) {
                    try {
                        await doReact(foundCmd.react, m, sock);
                    } catch (err) {
                        console.error(`❌ Failed to react for ${cmd}:`, err);
                    }
                }

                // Run the command handler
                await foundCmd.handler(sock, m, m, {
                    from,
                    sender,
                    reply: async (text) => await sock.sendMessage(from, { text }, { quoted: m }),
                    q: text
                });
            } catch (err) {
                console.error(`❌ Error running command ${cmd}:`, err);
            }
            return;
        }

        // Run ESM plugins found in plugins folder
        const pluginDir = path.resolve(__dirname, '..', 'plugins');
        try {
            const pluginFiles = await fs.readdir(pluginDir);
            for (const file of pluginFiles) {
                if (file.endsWith('.js')) {
                    const pluginPath = path.join(pluginDir, file);
                    try {
                        const pluginModule = await import(pathToFileURL(pluginPath).href);
                        if (pluginModule.default) {
                            await pluginModule.default(m, sock);
                        }
                    } catch (err) {
                        console.error(`❌ Failed to run ESM plugin: ${file}`, err);
                    }
                }
            }
        } catch (err) {
            console.error(`❌ Plugin folder error: ${pluginDir}`, err);
        }
    } catch (e) {
        console.error('❌ Handler crashed:', e);
    }
};

export default Handler;
