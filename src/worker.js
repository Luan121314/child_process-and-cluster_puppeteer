const {join} = require('path')
const queryString = require('querystring');

const {v1} = require('uuid');
const puppeteer = require('puppeteer');

const BASE_URL = 'https://erickwendel.github.io/business-card-template/index.html'

function createQueryStringFromObject(data){
    const separator = null;
    const keyDelimeter = null;
    const options = {
        encodeURIComponent: queryString.unescape
    }
    const qs = queryString.stringify(
        data,
        separator,
        keyDelimeter,
        options
    )

    return qs
}

async function render({finalURI, name}){
    const output = join(__dirname, `./../output/${name}-${v1()}.pdf`)
    const browser = await puppeteer.launch({
        // headless: true
    })
    const page = await browser.newPage();
    await page.goto(finalURI, {waitUntil: "networkidle2"}) // networkidle2 = espere toda página ser carrgada para ir ao proximo passo
    await page.pdf({
        path: output,
        format: 'A4',
        landscape: true,
        printBackground: true

    });

    await browser.close();
}


async function main(message){
    const pid = process.pid;
    console.log(`${pid} got a message `, message.name);
    const qs = createQueryStringFromObject(message);
    const finalURI = `${BASE_URL}?${qs}`;
    console.log(finalURI);

    try{
        await render({finalURI, name: message.name});
        process.send(`${pid} has finished`);    
    }catch(error){
        process.send(`${pid} has broken ${error.stack}`);    
    }

}

process.once('message', main); //lê o processo uma vez e mata em seguida

