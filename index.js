import dotenv from 'dotenv';
dotenv.config();

import {
    makeWASocket,
    Browsers,
    fetchLatestBaileysVersion,
    DisconnectReason,
    useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import { Handler, Callupdate, GroupUpdate } from './data/index.js';
import express from 'express';
import pino from 'pino';
import fs from 'fs';
import { File } from 'megajs';
import NodeCache from 'node-cache';
import path from 'path';
import chalk from 'chalk';
import moment from 'moment-timezone';
import axios from 'axios';
import config from './config.cjs';
import pkg from './lib/autoreact.cjs';
const { emojis, doReact } = pkg;
const prefix = process.env.PREFIX || config.PREFIX;
const sessionName = "session";
const app = express();
const orange = chalk.bold.hex("#FFA500");
const lime = chalk.bold.hex("#32CD32");
let useQR = false;
let initialConnection = true;
const PORT = process.env.PORT || 3000;
const require = createRequire(import.meta.url); // ✅ Required for .cjs support
import { createRequire } from 'module';

const MAIN_LOGGER = pino({
    timestamp: () => `,"time":"${new Date().toJSON()}"`
});
const logger = MAIN_LOGGER.child({});
logger.level = "trace";

const msgRetryCounterCache = new NodeCache();

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}

async function downloadSessionData() {
    console.log("Debugging SESSION_ID:", config.SESSION_ID);

    if (!config.SESSION_ID) {
        console.error('❌ Please add your session to SESSION_ID env !!');
        return false;
    }

    const sessdata = config.SESSION_ID.split("HANS-BYTE~")[1];

    if (!sessdata || !sessdata.includes("#")) {
        console.error('❌ INVALID SESSION ID, MAKE SURE YOU PAIRED FROM BOT SITE.');
        return false;
    }

    const [fileID, decryptKey] = sessdata.split("#");

    try {
        console.log("😇 LUNA MD DOWNLOADING YOUR SESSION... 😇");
        const file = File.fromURL(`https://mega.nz/file/${fileID}#${decryptKey}`);

        const data = await new Promise((resolve, reject) => {
            file.download((err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        await fs.promises.writeFile(credsPath, data);
        console.log("😇 SESSION SUCCESFULLY DOWNLOADED 😇");
        return true;
    } catch (error) {
        console.error('❌ Failed to download session data:', error);
        return false;
    }
}
import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

const decodedDirname = decodeURIComponent(__dirname);
const pluginFolder = path.join(decodedDirname, 'plugins');
const pluginFiles = readdirSync(pluginFolder).filter(file => file.endsWith('.js') || file.endsWith('.cjs'));

for (const file of pluginFiles) {
    const fullPath = join(pluginFolder, file);
    try {
        if (file.endsWith('.js')) {
            await import(pathToFileURL(fullPath).href);
            console.log(chalk.green(`✅ Plugin loaded (ESM): ${file}`));
        } else if (file.endsWith('.cjs')) {
            require(fullPath);
            console.log(chalk.blue(`✅ Plugin loaded (CJS): ${file}`));
        }
    } catch (e) {
        console.error(chalk.red(`❌ Failed to load plugin ${file}`), e);
    }
}


async function start() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const { version, isLatest } = await fetchLatestBaileysVersion();
        console.log(`🤖 LUNA MD RUNNING ON WhatsApp  v${version.join('.')}, isLatest: ${isLatest}`);
        
        const Matrix = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: useQR,
            browser: ["HANS_TECH", "safari", "3.3"],
            auth: state,
            getMessage: async (key) => {
                if (store) {
                    const msg = await store.loadMessage(key.remoteJid, key.id);
                    return msg.message || undefined;
                }
                return { conversation: "😇 LUNA MD BY HANS TECH 😇" };
            }
        });


Matrix.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
        if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) {
            start();
        }
    } else if (connection === 'open') {
        if (initialConnection) {
            console.log(chalk.green("😇 LUNA MD CONNECTED SUCCESFULLY TO WHATSAPP 😇"));
            Matrix.sendMessage(Matrix.user.id, { 
                image: { url: "https://i.ibb.co/9m0ZcH1N/Chat-GPT-Image-28-juin-2025-01-24-41.png" }, 
                caption: `
╔══════════════════════════╗
║    😇 𝐋𝐔𝐍𝐀 𝐌𝐃 𝐁𝐎𝐓 😇          
║  >>> CONNECTION ESTABLISHED ✅ 😇      
╠══════════════════════════╣
║   • PREFIX: [ *${config.PREFIX}* ]          
╟──────────────────────────╢
║ ♻ 𝐖𝐇𝐀𝐓𝐒𝐀𝐏𝐏 𝐂𝐇𝐀𝐍𝐍𝐄𝐋 𝐋𝐈𝐍𝐊      
║  https://whatsapp.com/channel/0029VaZDIdxDTkKB4JSWUk1O      
╟──────────────────────────╢
║ ♻ 𝐖𝐇𝐀𝐓𝐒𝐀𝐏𝐏 𝐆𝐑𝐎𝐔𝐏 𝐋𝐈𝐍𝐊       
║  https://chat.whatsapp.com/K0GPSSfr16j8VsIAU8uHYM            
╠══════════════════════════╣
║   𝐋𝐔𝐍𝐀 𝐌𝐃 - 𝐁𝐘 𝐇𝐚𝐧𝐬 𝐓𝐞𝐜𝐡 😇          
║  © Powered with care and love 😇           
╚══════════════════════════╝

`
            });
            initialConnection = false;
        } else {
            console.log(chalk.blue("♻️ Connection reestablished after restart."));
        }
    }
});
        
        Matrix.ev.on('creds.update', saveCreds);

        Matrix.ev.on("messages.upsert", async chatUpdate => await Handler(chatUpdate, Matrix, logger));
        Matrix.ev.on("call", async (json) => await Callupdate(json, Matrix));
        Matrix.ev.on("group-participants.update", async (messag) => await GroupUpdate(Matrix, messag));

        if (config.MODE === "public") {
            Matrix.public = true;
        } else if (config.MODE === "private") {
            Matrix.public = false;
        }

        Matrix.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];
                console.log(mek);
                if (!mek.key.fromMe && config.AUTO_REACT) {
                    console.log(mek);
                    if (mek.message) {
                        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                        await doReact(randomEmoji, mek, Matrix);
                    }
                }
            } catch (err) {
                console.error('Error during auto reaction:', err);
            }
        });
        
        Matrix.ev.on('messages.upsert', async (chatUpdate) => {
    try {
        const mek = chatUpdate.messages[0];
        const fromJid = mek.key.participant || mek.key.remoteJid;
        if (!mek || !mek.message) return;
        if (mek.key.fromMe) return;
        if (mek.message?.protocolMessage || mek.message?.ephemeralMessage || mek.message?.reactionMessage) return; 
        if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_STATUS_SEEN === "true") {
            await Matrix.readMessages([mek.key]);
            
            if (config.AUTO_STATUS_REPLY === "true") {
                const customMessage = config.STATUS_READ_MSG === "true" || '✅ Auto Status Seen';
                await Matrix.sendMessage(fromJid, { text: customMessage }, { quoted: mek });
            }
        }
    } catch (err) {
        console.error('Error handling messages.upsert event:', err);
    }
});

    } catch (error) {
        console.error('Critical Error:', error);
        process.exit(1);
    }
}

async function init() {
    if (fs.existsSync(credsPath)) {
        console.log("🔒 SESSION EXISTS... PROCEEDING WITHOUT QR.");
        await start();
    } else {
        const sessionDownloaded = await downloadSessionData();
        if (sessionDownloaded) {
            console.log("🔒 SESSION DOWNLOADED 😇. LUNA MD STARTING 😇.");
            await start();
        } else {
            console.log("No session found or downloaded, QR code will be printed for authentication.");
            useQR = true;
            await start();
        }
    }
}

init();

app.get('/', (req, res) => {
    res.send('😇 HANS TECH UNIVERSE 😇');
});

app.listen(PORT, () => {
    console.log(`HELLO 😇, i am running on port ${PORT}`);
});


