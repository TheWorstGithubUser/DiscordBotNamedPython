const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { chromium } = require("playwright");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('showsite')
		.setDescription('Displays the newest articles from newest to oldest'),
	async execute(interaction) {
		await interaction.deferReply();
		const articleList = await scrape();
		// Changing it to a txt file because we have way too many characters
		const buffer = Buffer.from(articleList, 'utf-8');
        const attachment = new AttachmentBuilder(buffer, { name: 'articles.txt' }); 

		await interaction.editReply({ 
                files: [attachment] 
            });
		//await interaction.reply('Displaying the newest articles: ' + articleList);
	},
};

async function scrape() {
  const browser = await chromium.launch();

  const page = await browser.newPage();

  let allTitles = [];

  await page.goto(
    'https://news.ycombinator.com/newest',
    { waitUntil: 'domcontentloaded' }
  );

  for (let i = 0; i < 4; i++) {
    const ranks = await page.locator('.rank').allInnerTexts();
    const titles = await page.locator('.titleline').allInnerTexts();

    ranks.forEach((title, index) => {
      allTitles.push(ranks[index] + " " + titles[index])
    });
      
    
    //allTitles.push(...ranks);
    //allTitles.push(...titles);

    const moreLink = page.locator('.morelink');

    if (await moreLink.count() === 0) {
      break;
    }

    const next = await moreLink.getAttribute('href');

    await page.goto(
      `https://news.ycombinator.com/${next}`,
      { waitUntil: 'domcontentloaded' }
    );
  }

  //console.log(allTitles.join('\n'));
  
  return String(allTitles.join('\n'))

  await browser.close();
}

scrape();