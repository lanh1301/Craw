import { CheerioCrawler, createCheerioRouter } from "crawlee"
import * as utils from './../../utils.js'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import { URL } from 'node:url'

export const router = createCheerioRouter()
// read data
import XLSX from 'xlsx';
const wb          = XLSX.readFile('./Data_DoanhNghiep/RTA Recruitment_ DS_Crawl Assignment.xlsx');
const sheetName = wb.SheetNames[1];
const worksheet = wb.Sheets[sheetName];
let urls                = []     
let row         = 3  
let count       = 0          
for (let cell in worksheet) {
    if (cell[0] === 'A') {
        if(cell.slice(1) == 2)
            continue
        if(cell.slice(1) == 3)
            continue
        let url_ = 'https://www.google.com/search?q=masothue.com+' + String(worksheet[cell].v) 
        urls.push(url_)
    }
}
console.log(urls.length)
console.log(urls[3])
router.addDefaultHandler(async ({ crawler, request, $, cheerio }) => {
    console.log(count)
    if (count == urls.length) {
        console.log(`[${utils.getCurrentDateTime()}] Processing Search Item: ${request.url}`)
        let href = $('#search #rso .yuRUbf a[href]').prop('href')
        await crawler.addRequests([{url:href, label:"MST"}])
        await crawler.addRequests([urls[count-1]])
        return
    }
    console.log(`[${utils.getCurrentDateTime()}] Processing Search Item: ${request.url}`)
    let href = $('#search #rso .yuRUbf a[href]').prop('href')
    await crawler.addRequests([{url:href, label:"MST"}])
    await crawler.addRequests([urls[count]])
    
    count++
    
    
      
    
})
router.addHandler('MST', async ({ crawler, request, $ }) => {
    console.log(`[${utils.getCurrentDateTime()}] Processing Search MST: ${request.url}`)

    let data        = utils.generateErichementData


    
    data.title      = $('.table-taxinfo td[itemprop="alternateName"] span').text() || $('.table-taxinfo th[itemprop="name"] span').text()
    data.mst        = $('.table-taxinfo td[itemprop="taxID"] span').text()
    data.phone      = $('.table-taxinfo td[itemprop="telephone"] span').text()
    worksheet['E' + row] = { t: 's', v: data.mst };
    worksheet['H' + row] = { t: 's', v: data.phone }
    row++
    XLSX.writeFile(wb, './Data_DoanhNghiep/RTA Recruitment_ DS_Crawl Assignment.xlsx');
})

