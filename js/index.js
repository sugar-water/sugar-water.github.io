let grid = document.getElementById("grid");
let tempCanvas = document.createElement("canvas");
let tempCxt = tempCanvas.getContext("2d");

const quote = `“Between words and objects one can create new relations and specify characteristics of language and objects generally ignored in everyday life.”
― René Magritte `.replace(/\s/g, "⚹");

const numPages = 14282;

let randomChar = () =>
    String.fromCharCode(97+Math.floor(Math.random() * 26));

let getSquareSideLength = (n) =>
{
    let rect = document.body.getClientRects()[0];
    let area = rect.width * rect.height;
    let nArea = area / n;
    let nSideLength = Math.sqrt(nArea);
    let nWide = Math.round(rect.width / nSideLength);
    let nHigh = Math.round(rect.height / nSideLength);
    return [nSideLength, nWide, nHigh];
}

let populateChars = (len, nWide, nHigh) => 
{
    let i = 0;
    return [...Array(nHigh).keys()].map((nH, i) => {
        return [...Array(nWide).keys()].map((nW, ii) => {
            span = document.createElement("span");
            span.classList.add("unit");
            if (i == 0 && ii == 0) {
                span.innerHTML = `<span class="unit contained">❋</span>`;
            }
            else {
                span.innerHTML = `<span class="unit contained">${quote[i % quote.length]}</span>`;
                i++;
            }
            span.style.width = `${len}px`;
            span.style.height = `${len}px`;
            span.style.left = `${nW*len}px`
            span.style.top = `${nH*len}px`
            grid.appendChild(span);
            return span
        });
    });
}

let centerGrid = (len, nWide, nHigh) => {
    let w = len * nWide;
    let h = len * nHigh;
    grid.style.height = `${h}px`;
    grid.style.width = `${w}px`;
}

Array.prototype.sample = function() {
    return this[Math.floor(Math.random() * this.length)];
}

let getRandomImage = async () => 
{
    let randomPage = Math.floor(Math.random() * numPages);
    url = `https://api.artic.edu/api/v1/images?page=${randomPage}&limit=20`;
    let randomInt = Math.floor(Math.random() * 20);
    return fetch(url)
        .then(r => r.json())
        .then(d => {
            let title = d["data"][randomInt]["artwork_titles"][0];
            let url = d["data"][randomInt]["iiif_url"] + "/full/843,/0/default.jpg";
            return [title, url];
        })
        .catch(console.log);
}

let renderImg = async (url, units) => 
{
    let imgObj = new Image;
    imgObj.crossOrigin = "Anonymous";
    imgObj.onload = function() {
        this.width = units.length;
        this.height = units[0].length;
        tempCxt.drawImage(this, 0, 0, this.width, this.height);
        pixels = tempCxt.getImageData(0, 0, this.width, this.height).data
        colorTheUnits(units, pixels)
    }
    imgObj.src = url;
}

let colorTheUnits = (units, pixels) => {
    let flatUnits = units.flat();
    for (let i = 0, j = 0; i < pixels.length, j < flatUnits.length; i += 4, j += 1) {
        setTimeout(() => { 
            unit = flatUnits[j];
            let r = pixels[i];
            let g = pixels[i+1];
            let b = pixels[i+2];
            if (!unit.style.backgroundColor) {
                unit.style.backgroundColor = `rgb(${r},${g},${b})`;
            }
            if (((r+g+b)/3) < 100) {
                unit.style.color = "white";
            }
            if (!unit.titleSet && j !== 0) {
                unit.firstChild.innerText = randomChar();
            }
        }, Math.random() * 50000);
    }
}

const insertTitle = (title, units) => {
    console.log("Title of Artwork:", title);
    let lastRow = units[units.length - 1];
    let width = units[0].length;
    let betterTitle = title.replace(/\s/g, "⚹");
    lastRow.forEach((u, i) => {
        setTimeout(() => {
            u.titleSet = true;
            if (i < betterTitle.length) {
                u.firstChild.innerText = betterTitle[i];
            } else {
                u.firstChild.innerText = "⚹";
            }
        }, i * 2000);
    });
}

let linkImg = (units) => {
    linker = units[0][0];
    linker.id = "link-to-image";
    return (url) => { linker.onclick = () => window.open(url); }
}

let setup = (n) => 
{
    let u = getSquareSideLength(n)
    let units = populateChars(...u);
    let linkUrl = linkImg(units);
    centerGrid(...u);
    getRandomImage()
        .then(([title, url]) => {
            linkUrl(url);
            renderImg(url, units);
            if (title) { insertTitle(title, units); } 
        })
        .catch(console.log);
}

window.onload = () => {
    if (document.body.clientWidth < 400) { setup(250) }
    else if (document.body.clientWidth < 600) { setup(300) }
    else if (document.body.clientWidth < 800) { setup(500) }
    else if (document.body.clientWidth < 1000) { setup(700) }
    else if (document.body.clientWidth < 1200) { setup(900) }
    else if (document.body.clientWidth < 1500) { setup(1100) }
    else if (document.body.clientWidth < 2000) { setup(1400) }
}
