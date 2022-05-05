const { Client, Collection, Intents: { FLAGS } } = require('discord.js'),
	{ token, messages } = require('./config.js');

const bot = new Client({
	partials: ['GUILD_MEMBER', 'USER', 'MESSAGE', 'CHANNEL', 'REACTION', 'GUILD_SCHEDULED_EVENT'],
	intents: [FLAGS.GUILDS, FLAGS.GUILD_MEMBERS, FLAGS.GUILD_BANS, FLAGS.GUILD_EMOJIS_AND_STICKERS,
		FLAGS.GUILD_MESSAGES, FLAGS.GUILD_MESSAGE_REACTIONS, FLAGS.DIRECT_MESSAGES, FLAGS.GUILD_VOICE_STATES, FLAGS.GUILD_INVITES,
		FLAGS.GUILD_SCHEDULED_EVENTS],
});
bot.guildInvites = new Collection();

bot.on('ready', async client => {
	console.log(`${client.user.tag} is online.`);

	// Fetch all invites from guilds
	for (const guild of [...bot.guilds.cache.values()]) {
		try {
			const invites = await guild.invites.fetch();
			if (guild.vanityURLCode) invites.set(guild.vanityURLCode, await guild.fetchVanityData());
			bot.guildInvites.set(guild.id, invites);
		} catch (err) {
			console.log(`Error on guild ${guild.id}: ${err.message}`);
		}
	}

	console.log(bot.guildInvites);
});

// An invite was created
bot.on('inviteCreate', async ({ guild }) => {
	// Update invite collection
	const invites = await guild.invites.fetch();
	if (guild.vanityURLCode) invites.set(guild.vanityURLCode, await guild.fetchVanityData());
	bot.guildInvites.set(guild.id, invites);
});

// An invite was deleted
bot.on('inviteDelete', async ({ guild }) => {
	// Update invite collection
	const invites = await guild.invites.fetch();
	if (guild.vanityURLCode) invites.set(guild.vanityURLCode, await guild.fetchVanityData());
	bot.guildInvites.set(guild.id, invites);
});

// Someone joined a server
bot.on('guildMemberAdd', async member => {
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
	const toSend = messages.welcome.replace(/\{member\}/g, member.toString()).replace(/\{inviter\}/g, usedInvite.inviter.tag).replace(/\{invites\}/g, usedInvite.uses);
	welcomeChannel.send({ content: toSend }).catch(err => console.log(err));
});

// Someone joined a server
bot.on('guildMemberRemove', async member => {
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
});

bot.login(token);
