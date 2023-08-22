import { createPlaywrightRouter, playwrightUtils } from "crawlee"
import * as utils from './../../utils.js'
import * as playwright from 'playwright'
import { URL } from 'node:url'
import XLSX from 'xlsx';

export const router = createPlaywrightRouter()

const workbook = XLSX.readFile('Code_Train/crawlers-master/src/LamGiauDuLieu/data.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];



router.addDefaultHandler(async ({ crawler, page, enqueueLinks, parseWithCheerio }) => {
    console.log(`[${utils.getCurrentDateTime()}] Processing Page Item: ${page.url()}`)
    
    var lat,long
    let requestURL = new URL( page.url() )
    let hostname   = requestURL.origin 
    var row = 73;
    for (let cell in worksheet) {
        if (cell[0] === 'C') {
            if(cell.slice(1) < 73)
                continue

            await page.type('input[aria-label*="Search Google Maps"]', worksheet[cell].v)
            // await page.type('input[aria-label*="Search Google Maps"]', 'Số 564 Đường Hoàng Mai, Tổ 32, Phường Hoàng Văn Thụ, Q. Hoàng Mai, Hà Nội')
            await page.click('.id-content-container #searchbox-searchbutton')
            await page.waitForTimeout(3000)
            const elementHandle = await page.$('#QA0Szd div[role*="feed"] a[href]')
        
            if (elementHandle) {
                let hre     = await page.locator('#QA0Szd div[role*="feed"] a[href] ').first().getAttribute('href')
                const startIndex = hre.indexOf('!3d') + 3
                const endIndex = hre.indexOf('!4d')
                lat = hre.substring(startIndex, endIndex)

                const longIndex = hre.indexOf('!4d') + 3
                long = hre.substring(longIndex).split('!')[0]
            }
            else {
                await page.waitForTimeout(1000)
                let hre = page.url()
                const startIndex = hre.indexOf('!3d') + 3
                const endIndex = hre.indexOf('!4d')
                lat = hre.substring(startIndex, endIndex)

                const longIndex = hre.indexOf('!4d') + 3
                long = hre.substring(longIndex).split('!')[0]
            }
            
            worksheet['L' + row] = { t: 's', v: lat };
            worksheet['M' + row] = { t: 's', v: long }
            row++
            await page.fill('input[aria-label*="Search Google Maps"]','')
            XLSX.writeFile(workbook, 'Code_Train/crawlers-master/src/LamGiauDuLieu/data.xlsx');
        }
        
    }
      
    await page.pause()
})