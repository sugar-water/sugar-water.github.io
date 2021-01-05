let fetch = require("node-fetch");
let d3 = require("d3");
let fs = require("fs").promises

global.fetch = fetch;

let isPainting = (artwork) => artwork["Classification"] === "Painting"

url = "https://media.githubusercontent.com/media/MuseumofModernArt/collection/master/Artworks.csv"
d3.csv(url)
    .then(d => {
       let justPaintings = d.filter(isPainting);
       console.log("# of paintings: ", justPaintings.length)
       let urls = justPaintings.map(p => p["ThumbnailURL"]);
       let json = JSON.stringify(urls);
       fs.writeFile("web/assets/painting-urls.json", json)
         .catch(e => console.log(e));
    });

    
