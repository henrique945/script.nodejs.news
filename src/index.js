require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');

const discordWebhookURL = process.env.DISCORD_WEBHOOK_URL;

async function getNews() {
  console.log('Get some news');

  const links = new Map([
    ['NatinalGeographic', getNationalGeographicNews],
    ['Wired', getWiredNews],
    ['TheVerge', getTheVergeNews],
  ]);

  const news = [];
  for (const [name, get] of links) {
    console.log(`Buscando ${name}...`);
    const tempNews = await get();

    if (tempNews) news.push(...tempNews);
  }

  return news;
}

async function getNationalGeographicNews() {
  const link = 'https://www.nationalgeographic.com/';
  const { data } = await axios.get(link);
  const $ = cheerio.load(data);

  const headlines = [];
  $('.HomepagePromos__row').each((index, element) => {
    let headline = $(element).text().trim();
    if (headline) {
      const referenceLink = $(element).find('a').attr('href');

      if (referenceLink) {
        headline += ' - ' + referenceLink;
      }
      headlines.push(headline);
    }
  });
  return headlines;
}

async function getWiredNews() {

}

async function getTheVergeNews() {

}

async function sendToDiscord(news) {
  for (let item of news) {
    await axios.post(discordWebhookURL, { content: item });
  }
}

(async () => {
  try {
    const news = await getNews();
    await sendToDiscord(news);

    console.log('Noticias enviadas para o Discord com sucesso');
  } catch (e) {
    console.log('Erro ao enviar noticias: ', e);
  }
})();