require('dotenv').config();
const express = require('express');
const cors = require('cors');
const deepl = require('deepl-node');
const { getWordsList } = require('most-common-words-by-language');
const _ = require('lodash');
const app = express();
const port = process.env.PORT || 8080;

const API_KEY = process.env.API_KEY;
const translator = new deepl.Translator(API_KEY);
app.use(cors());

const logUsage = async () => {
  const usage = await translator.getUsage();
  if (usage.anyLimitReached()) {
    console.log('Translation limit exceeded.');
  }
  if (usage.character) {
    console.log(
      `Characters: ${usage.character.count} of ${usage.character.limit}`
    );
  }
  if (usage.document) {
    console.log(
      `Documents: ${usage.document.count} of ${usage.document.limit}`
    );
  }
};

app.get('/words/:amount', (req, res) => {
  const amount = req.params.amount;
  const words = getWordsList('finnish');
  const response = _.sampleSize(words, amount).filter(
    (word) => word.length > 1
  );
  res.json(response);
});

app.get('/translate/:word', async (req, res) => {
  const word = req.params.word;
  const result = await translator.translateText(word, 'fi', 'en-GB');
  await logUsage();
  res.json({
    result: result.text,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
