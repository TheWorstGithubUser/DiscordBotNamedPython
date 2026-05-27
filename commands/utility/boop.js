// This was the start of the project, and something small I made for fun
// to dip my toe in the water of Discord bot making

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('boop')
		.setDescription('booptehsnek'),
	async execute(interaction) {
		await interaction.reply('o///o');
	},
};
