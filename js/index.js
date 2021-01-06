let grid = document.getElementById("grid");
let tempCanvas = document.createElement("canvas");
let tempCxt = tempCanvas.getContext("2d");

const quote = "/)"

// JS needs python comprehensions.
const arrowsMap = {
    2190: 2192, 2192: 2190,
    2191: 2193, 2193: 2191,
    2194: 2194, 2195: 2195,
    2196: 2198, 2198: 2196,
    2197: 2199, 2199: 2197,
};
const arrows = Object.values(arrowsMap)

const numPages = 14282;
let randomArrow = () => arrows[Math.floor(Math.random() * (arrows.length- 1))]

let getSquareSideLength = (n) =>
{
    let rect = document.body.getClientRects()[0];
    let area = rect.width * rect.height;
    let nArea = area / n;
    let nSideLength = Math.sqrt(nArea);
    let nWide = Math.round(rect.width / nSideLength);
    let nHigh = Math.round(rect.height / nSideLength);
    return [nSideLength - 0.3, nWide, nHigh];
}

let populateChars = (len, nWide, nHigh) => 
{
    let _i = 0;
    return [...Array(nHigh).keys()].map((nH, i) => {
        return [...Array(nWide).keys()].map((nW, ii) => {
            span = document.createElement("span");
            span.classList.add("unit");
            if (i == 0 && ii == 0) {
                span.innerHTML = `<span class="unit contained">❋</span>`;
            }
            else {
                span.innerHTML = `<span class="unit contained">${quote[_i % quote.length]}</span>`;
                _i++;
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

let centerGrid = (len, nWide, nHigh) => 
{
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
            if (((r+g+b)/3) < 130) {
                unit.style.color = "white";
            }
            if (!unit.titleSet && j !== 0) {
                let rArrow = randomArrow();
                unit.firstChild.innerText = String.fromCharCode("0x" + rArrow);
                if (Math.random() <= 0.5) {
                    let oArrow = arrowsMap[rArrow];
                    unit.originalArrow = unit.firstChild.innerText;
                    unit.reversedArrow = String.fromCharCode("0x" + oArrow);
                    unit.addEventListener("mouseover", function() {
                        this.firstChild.innerText = this.reversedArrow;
                    })
                    unit.addEventListener("mouseout", function() {
                        this.firstChild.innerText = this.originalArrow;
                    })
                }
            }
        }, Math.random() * 50000);
    }
}

const insertTitle = (title, units) => {
    console.log("Title of Artwork:", title);
    let lastRow = units[units.length - 1];
    let betterTitle = title.replace(/\s/g, "⚹");
    lastRow.forEach((u, i) => {
        setTimeout(() => {
            u.titleSet = true;
            if (u.originalArrow) {
                u.originalArrow = betterTitle[i];
            }
            if (i < betterTitle.length) {
                u.firstChild.innerText = betterTitle[i];
            } else {
                u.firstChild.innerText = "⚹";
            }
        }, i * 2000);
    });
}

let linkImg = (units) => 
{
    linker = units[0][0];
    linker.id = "link-to-image";
    return (url) => { linker.onclick = () => window.open(url); }
}

let makeMainMenu = (units) => 
{
    mm = document.getElementById("main-menu");
    beginL = 1;
    endL = units[0].length - 10;
    beginT = 1;
    endT = units.length - 10;
    rtop = Math.floor(Math.random() * (endT - beginT) + beginT);
    rleft = Math.floor(Math.random() * (endL - beginL) + beginL);
    let getTL = (top, left) => [units[top][left].style.top, units[top][left].style.left];
    [top_, left_] = getTL(rtop, rleft);
    console.log(beginL, endL, units[0].length)
    console.log(beginT, endT, units.length)
    mm.style.top = top_;
    mm.style.left = left_;
    mm.style.width = parseFloat(units[0][0].style.width) * 10 + "px";
    mm.style.height = parseFloat(units[0][0].style.height) * 10 + "px";
    mm.style.display = "block";
}

let setup = (n) => 
{
    let u = getSquareSideLength(n);
    let units = populateChars(...u);
    centerGrid(...u);
    makeMainMenu(units);
    let linkUrl = linkImg(units);
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
    else if (document.body.clientWidth < 600) { setup(200) }
    else if (document.body.clientWidth < 800) { setup(500) }
    else if (document.body.clientWidth < 1000) { setup(700) }
    else if (document.body.clientWidth < 1200) { setup(900) }
    else if (document.body.clientWidth < 1500) { setup(1100) }
    else if (document.body.clientWidth < 2000) { setup(1400) }
}
