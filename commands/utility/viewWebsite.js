const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { chromium } = require("playwright");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('showsite')
		.setDescription('Displays the newest articles from newest to oldest'),
	async execute(interaction) {
		await interaction.deferReply(); 
    //We have to call this method in order to give our bot more time to think.
    //Default time is 3 seconds, and this gives us 15 minutes

		const articleList = await scrape();
		// Changing it to a txt file because we have way too many characters
		const buffer = Buffer.from(articleList, 'utf-8');
        const attachment = new AttachmentBuilder(buffer, { name: 'articles.txt' }); 
		await interaction.editReply({ 
                files: [attachment] 
            });
	},
};

//delay function
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function scrape() {
  const browser = await chromium.launch();

  const page = await browser.newPage();

  await page.goto(
    'https://news.ycombinator.com/newest',
    { waitUntil: 'domcontentloaded' }
  );

  const allTitles = [];
  var lastPostDate;
  var sortedByNewestToOldest = true;
  
  for (let i = 0; i < 4; i++) {
    //Grab relevant text from the website
    const ranks = await page.locator('.rank').allInnerTexts();
    const titles = await page.locator('.titleline').allInnerTexts();
    const age = await page.locator('.age').allInnerTexts();
    //Grab the UTC time, as the generic age text isn't 100% accurate
    const exactUTCTimes = await page.locator('.age').evaluateAll(links => 
      links.map(link => link.getAttribute('title'))
    );

    ranks.some((rank, index) => {
      allTitles.push(rank + " " + titles[index] + ", " + age[index]);
      if(index >= 1 || i >= 1){ //ensures the variable lastPostDate has something in it before we compare
        var selectedDate = exactUTCTimes[index]; //We have to .split here because exactUTCTimes also grabs
        if(lastPostDate < selectedDate){
          sortedByNewestToOldest = false;
        }
        lastPostDate = selectedDate;
      }else{
        lastPostDate = selectedDate;
      }
      return (rank == "100.") //We don't need more than 100. We're pushing Discord's text limit as is anyway
    });

    const moreLink = page.locator('.morelink'); //Locate the button to navigate to the next page

    if (await moreLink.count() === 0) { //Should never be needed in our case but why not
      break; 
    }

    const next = await moreLink.getAttribute('href');

    await page.goto(
      `https://news.ycombinator.com/${next}`,
      { waitUntil: 'domcontentloaded' }
    );

    await delay(30000); //hackernews has a crawl-delay of 30 seconds, so this is super slow but necessary
  }
  
  await browser.close();
  if(sortedByNewestToOldest)
    allTitles.push("Articles are all sorted from newest to oldest!")
  else
    allTitles.push("The articles are NOT sorted from newest to oldest")

  return allTitles.join('\n');
}

scrape();
