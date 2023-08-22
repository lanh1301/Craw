import { CheerioCrawler, createCheerioRouter } from "crawlee"
import * as utils from './../../utils.js'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import { URL } from 'node:url'

export const router = createCheerioRouter()
// read data
import XLSX from 'xlsx';
import { count } from "node:console"

let row = 4
const wb          = XLSX.readFile('./Data_DoanhNghiep/RTA Recruitment_ DS_Crawl Assignment.xlsx');
const sheetName = wb.SheetNames[1];
const worksheet = wb.Sheets[sheetName];
let url_
router.addDefaultHandler(async ({ crawler, request, $ }) => {
    // console.log(`[${utils.getCurrentDateTime()}] Processing Search Item: ${request.url}`)
    
    for (let cell in worksheet) {
        if (cell[0] === 'A') {
            if(cell.slice(1) == 2)
                continue
            if(cell.slice(1) == 3){
                continue
            }
            
            url_ = 'https://www.google.com/search?q=%22email%22+' + String(worksheet[cell].v) 
            await crawler.addRequests([{url: url_, label:'ITEM'}])
            
            
        }
    }
})

router.addHandler('ITEM', async ({ crawler, request, $ }) => {
    console.log(`[${utils.getCurrentDateTime()}] Processing Search ITEM: ${request.url}`)

    let temp    = $('#search #rso div').eq(0).text()
    let email   = temp.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g)??''
    email       = email[0] || ''
    console.log(email)
    worksheet['F' + row] = { t: 's', v: email}
    row++
    XLSX.writeFile(wb, './Data_DoanhNghiep/RTA Recruitment_ DS_Crawl Assignment.xlsx');

    
    
})
