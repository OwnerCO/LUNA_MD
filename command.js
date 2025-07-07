import config from './config.cjs';

const commands = [];
const prefix = config.PREFIX || ".";

/**
 * Register a command with prefix filtering
 * @param {{
 *   pattern: string,
 *   alias?: string[],
 *   desc?: string,
 *   category?: string,
 *   react?: string,
 *   use?: string,
 *   filename?: string
 * }} info
 * @param {Function} func
 */
export function cmd(info, func) {
  if (!info?.pattern || typeof func !== 'function') {
    throw new Error("❌ Invalid command definition.");
  }

  const fullPattern = prefix + info.pattern;
  const aliases = info.alias?.map(a => prefix + a) || [];

  const command = {
    ...info,
    pattern: fullPattern,
    alias: aliases,
    handler: func,
  };

  commands.push(command);
}

/**
 * Get all commands
 * @returns {Array}
 */
export function getAllCommands() {
  return commands;
}

/**
 * Match a command by exact prefixed input
 * @param {string} input
 * @returns {object|undefined}
 */
export function getCommand(input) {
  return commands.find(cmd =>
    cmd.pattern === input || (Array.isArray(cmd.alias) && cmd.alias.includes(input))
  );
}
