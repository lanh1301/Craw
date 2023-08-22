import { CheerioCrawler, createCheerioRouter } from "crawlee"
import * as utils from './../../utils.js?'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import { URL } from 'node:url'

export const router = createCheerioRouter()
import XLSX from 'xlsx';
const workbook = XLSX.readFile('./Code_Train/crawlers-master/src/LamGiauDuLieu/data_normalize.xlsx');
const sheet_name_list = workbook.SheetNames;
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
let urls = []
data.forEach(element => {
    var url = 'https://masocongty.vn/search?name="' + String(element[0]).split('__')[0] + '"&by=cvn&pro=' + String(element[0]).split('__')[1]
    urls.push(url)
});

router.addDefaultHandler(async({ crawler,request,$ }) => {
    console.log(`[${utils.getCurrentDateTime()}] Processing Page Item: ${request.url}`)

    // await crawler.addRequests([urls])
    let x       = $('.listview-outlook .list-content').text().replace(/\t/g, '').replace(/\n\n/g, '___').trim().split('___')
    console.log(x)

    const workbook = XLSX.utils.book_new() 
    const worksheet = XLSX.utils.json_to_sheet([]) 

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1') 

    XLSX.writeFile(workbook, 'example.xlsx')

    crawler.addRequests(urls)
})





