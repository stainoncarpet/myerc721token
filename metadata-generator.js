/* eslint-disable node/no-unpublished-require */
/* eslint-disable promise/param-names */
/* eslint-disable no-undef */
/* eslint-disable node/handle-callback-err */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */

const axios = require("axios").default;
const fs = require("fs");
const path = require("path");
const client = require("https");
const PImage = require("pureimage");

const main = async () => {
  const metadataDir = './metadata';
  const imagesDir = './images';

  const responses = [];

  // just get data
  for (let index = 0; index < 15; index++) {
    const res = await axios.get("https://swapi.dev/api/people/" + (index + 1));
    responses.push(res);
  }

  // ipfs://<hash>, e.g. ipfs://QmTy8w65yBXgyfG2ZBg5TrfB2hPjrDQH3RCQFJGkARStJb

  // make images
  if (process.argv[2] === "generate-images") {
    if (fs.existsSync(imagesDir)) { fs.rmdirSync(imagesDir, { recursive: true }, () => console.log("removed folder")); }
    fs.mkdir(imagesDir, () => console.log("created folder"));

    for (let index = 0; index < responses.length; index++) {
      makeImage(responses[index], imagesDir, index + 1);
    }
  // make metadata and include hash
  } else if (process.argv[2] === "generate-metadata" && process.argv[3].length === 46) {
    if (fs.existsSync(metadataDir)) { fs.rmdirSync(metadataDir, { recursive: true }, () => console.log("removed folder")); }
    fs.mkdir(metadataDir, () => console.log("created folder"));

    for (let index = 0; index < responses.length; index++) {
      makeJson(responses[index], metadataDir, index + 1, "ipfs://" + process.argv[3]);
    }
  }
};

const getEntries = (apiResponseData) => {
  const traitsObj = {
    name: apiResponseData.data.name,
    height: apiResponseData.data.height,
    mass: apiResponseData.data.mass,
    hair_color: apiResponseData.data.hair_color,
    skin_color: apiResponseData.data.skin_color,
    eye_color: apiResponseData.data.eye_color,
    birth_year: apiResponseData.data.birth_year,
    gender: apiResponseData.data.gender,
  };
  const entries = Object.entries(traitsObj);
  return entries;
};

const makeJson = (apiResponseData, metadataDir, fileIndex, imgFolderHash) => {
  const entries = getEntries(apiResponseData);
  const metadataObj = {
    name: apiResponseData.data.name,
    description: `${apiResponseData.data.name} is a character from the Star Wars universe`,
    external_url: `https://duckduckgo.com/?q=` + apiResponseData.data.name.split(' ').join('+'),
    image: imgFolderHash + "/" + fileIndex + ".jpg",
    attributes: entries.map(([traitKey, traitValue]) => {
      return { "trait_type": traitKey, "value": traitValue }
    })
  }

  fs.writeFileSync(`${metadataDir}/${fileIndex}.json`, JSON.stringify(metadataObj), (err) => {
    if (!err) { console.log('done'); }
  });
};

const makeImage = (apiResponseData, imgPath, fileIndex) => {
  const entries = getEntries(apiResponseData);
  const url = "https://starwarsblog.starwars.com/wp-content/uploads/2020/04/star-wars-backgrounds-25.jpg"
  const filepath = `${imgPath}/${fileIndex}.jpg`
  const font = PImage.registerFont("./star-jedi-font/StarJediHollow-A4lL.ttf", 'Star Jedi Hollow');

  font.load(() => {
    client.get(url, (imageStream) => {
      PImage.decodeJPEGFromStream(imageStream).then(img => {
        const ctx = img.getContext('2d');
        ctx.fillStyle = '#FFF';
        ctx.font = "60pt MyFont";

        for (let index = 0; index < entries.length; index++) {
          ctx.fillText(entries[index][0] + " - " + entries[index][1], 200, 200 + (index + 1) * 45 + index * 10);
        }

        PImage.encodePNGToStream(img, fs.createWriteStream(filepath)).then(() => {
          console.log("done writing to ", filepath)
        })
      });
    })
  });
};

main();