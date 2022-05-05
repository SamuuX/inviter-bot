// Dependencies
const { messages } = require('../config'),
	Event = require('../structures/Event');

/**
 * Guild member remove event
 * @event Egglord#GuildMemberRemove
 * @extends {Event}
*/
class GuildMemberRemove extends Event {
	constructor(...args) {
		super(...args, {
			dirname: __dirname,
		});
	}

	/**
	 * Function for receiving event.
	 * @param {bot} bot The instantiating client
	 * @param {GuildMember} member The member that has left/been kicked from a guild
	 * @readonly
	*/
	async run(bot, member) {
		const { guild } = member,
			welcomeChannel = bot.channels.cache.get('815658902158573569');

		// Make sure it's not a bot
		if (member.user.bot) return;

		// Server doesn't have any invites
		const inviter = bot.guildInvites.get(guild.id);
		if (!inviter) return;

		// Get the updated invites to find the change
		const newInvites = await guild.invites.fetch();
		if (guild.vanityURLCode) newInvites.set(guild.vanityURLCode, await guild.fetchVanityData());
		bot.guildInvites.set(guild.id, newInvites);

		const usedInvite = newInvites.find(inv => inviter.get(inv.code).uses < inv.uses);
		// Wasn't able to find the invite
		if (!usedInvite) return welcomeChannel.send(`${member} has joined the server but I do not know how. Perhaps a temporary invite?`).catch(err => console.log(err));

		// Joined via the vanity URL
		if (usedInvite.code === member.guild.vanityURLCode) return welcomeChannel.send(`${member} has joined the server using the vanity link!`);

		if (!welcomeChannel) return;
		const toSend = messages.leave.replace(/\{member\}/g, member.toString()).replace(/\{inviter\}/g, usedInvite.inviter.tag).replace(/\{invites\}/g, usedInvite.uses);
		welcomeChannel.send({ content: toSend }).catch(err => console.log(err));
	}
}

module.exports = GuildMemberRemove;
