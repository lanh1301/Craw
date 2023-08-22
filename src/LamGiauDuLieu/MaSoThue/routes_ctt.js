import { createPlaywrightRouter, playwrightUtils } from "crawlee"
import * as utils from './../../utils.js'
import * as playwright from 'playwright'
import { URL } from 'node:url'

export const router = createPlaywrightRouter()
// read data
import XLSX from 'xlsx';
const workbook = XLSX.readFile('./Code_Train/crawlers-master/src/LamGiauDuLieu/data_nor_DVTT.xlsx');
const sheet_name_list = workbook.SheetNames;
const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
let company_name    = []
let value_          = []
data.forEach(element => {
    company_name.push(String(element[0]).split('__')[0]) 
    value_.push(String(element[0]).split('__')[1])
});
router.addDefaultHandler(async ({ crawler, page, enqueueLinks, parseWithCheerio }) => {
    console.log(`[${utils.getCurrentDateTime()}] Processing Page Item: ${page.url()}`)

    let requestURL = new URL( page.url() )
    let hostname   = requestURL.origin 

    await page.click('.ProdGroupPage #FrontPG-2')
    await page.waitForSelector('.ProdGroupPage .FrontProdGroups #FrontPGT-2')
    await page.click('.ProdGroupPage .FrontProdGroups #FrontPGT-2 #LnkActiveProdGroup')
    for (let index = 0; index < value_.length; index++) {

        await page.fill('.wwDivFilter .wwRowFilter #ctl00_C_UC_ENT_LIST1_NAMEFilterFld', company_name[index])
        const select = await page.$('.wwDivFilter .wwRowFilter #ctl00_C_UC_ENT_LIST1_CITY_IDFld')

        select.selectOption({value: value_[index]})
        await page.click('.wwDivFilter input[value*="Tìm kiếm"]')
        let check   = (await page.locator('#ctl00_C_UC_ENT_LIST1_PnlListResult i b').innerText()|| '').trim()
        if (check == '0'){
            console.log(check)
            continue;
        }
            
        // await page.waitForSelector('.gridview')
        let x       =  await page.locator('.gridview #ctl00_C_UC_ENT_LIST1_CtlList_ctl02_Cmd2').innerText() || ''
        await page.fill('.wwDivFilter .wwRowFilter #ctl00_C_UC_ENT_LIST1_NAMEFilterFld', '')
        console.log(company_name[index])
        console.log(x)
        
        
    }
    
    await page.pause()
})