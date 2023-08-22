import { CheerioCrawler, createCheerioRouter } from "crawlee"
import * as utils from './../../utils.js'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import { URL } from 'node:url'
import validator  from 'validator'
import dns from 'dns'

export const router = createCheerioRouter()


import XLSX from 'xlsx'
// Đường dẫn file data 
let url_data = 'Code_Train/crawlers-master/src/LamGiauDuLieu/data.xlsx'

// 1 số biến toàn cục trong bài, row và row1 dùng để chỉnh số hàng ghi vào file excel
let row = 99
let row1 = 99
let row2 = 99
let row3 = 99
let row4 =  99

let url_mst 
let url_email
let url_fb
let url_linkedin
let url_web

// Đọc file excel bằng thư viện XLSX , 
const wb          = XLSX.readFile(url_data);
const sheetName = wb.SheetNames[0];
const worksheet = wb.Sheets[sheetName];


router.addDefaultHandler(async ({ crawler, request, $ }) => {
    console.log(`[${utils.getCurrentDateTime()}] Processing Search Item: ${request.url}`)
    
    for (let cell in worksheet) {
        if (cell[0] === 'A') {
            if(cell.slice(1) < 99)
                continue
            url_mst = 'https://www.google.com/search?q=masothue.com+' + String(worksheet[cell].v) 
            await crawler.addRequests([{url: url_mst, label:'MST'}])
            
            url_email = 'https://www.google.com/search?q=%22email%22+' + String(worksheet[cell].v) 
            await crawler.addRequests([{url: url_email, label:'Email'}])

            url_fb = 'https://www.google.com/search?q=%22facebook%22+' + String(worksheet[cell].v) 
            await crawler.addRequests([{url: url_fb, label:'FB'}])

            url_linkedin = 'https://www.google.com/search?q=%22Linkedin%22+' + String(worksheet[cell].v) 
            await crawler.addRequests([{url: url_linkedin, label:'Linkedin'}])
        }
    }
})

// Xử lý những URL có label là MST
router.addHandler('MST', async ({ request, $ }) => {
    console.log(`[${utils.getCurrentDateTime()}] Processing Search MST: ${request.url}`)

    let MST  = getMST_Phone($)
})

const getMST_Phone = async ($) => {
// Tìm địa chỉ trang web chứ thông tin mst trên gg
    let href = $('#search #rso .yuRUbf a[href]').prop('href')

// Dùng fetch để tải trang web vừa được tìm thấy ở trên 
    let MSTResp = await fetch(href)
    let respBody     = await MSTResp.text()
    let $$           = $.load(respBody)
    let mst       = $$('.table-taxinfo td[itemprop="taxID"] span').text()

    let phone      = $$('.table-taxinfo td[itemprop="telephone"] span').text()
    worksheet['E' + row] = { t: 's', v: mst };
    worksheet['J' + row] = { t: 's', v: phone }
    row++
    XLSX.writeFile(wb, url_data);
}

// Xử lý url có label là Email
router.addHandler('Email', async ({  request, $ }) => {
    console.log(`[${utils.getCurrentDateTime()}] Processing Search Email: ${request.url}`)
    let EMAIL = getEmail($)
})

const getEmail = async ($) => {
    // Tìm và lấy ra phần có chứa nội dung chưa email, tách chuỗi email
    let temp    = $('#search #rso div div[data-sncf="1"]').text()
    let email   = temp.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g)??''
    email       = email[0] || ''

    if (email == 'ntv@vieclam24h.vn')
        email = ''
    if (email == 'info@masothue.com')
        email = ''
    if (validator.isEmail(email)){
        // Kiểm tra email có tồn tại không
        const domain = email.split('@')[1]
        dns.resolveMx(domain, (err, addresses) => {
            if (err) {
                worksheet['G' + String(row4)] = { t: 's', v: 'False'}
            }
            else{
                worksheet['G' + String(row4)] = { t: 's', v: 'True'}
            }
            row4++
            XLSX.writeFile(wb, url_data);
          });
    }
    else{
        email = ''
        row4++
    }
    worksheet['F' + String(row1)] = { t: 's', v: email}
    row1++
    XLSX.writeFile(wb, url_data);

    

    

}

// Xử lý url label FB
router.addHandler('FB' , async( { request , $}) => {
    console.log(`[${utils.getCurrentDateTime()}] Processing Search FB: ${request.url}`)
    let fb = getFB($)
})

const getFB = async ($) => {
    let check = $('#search #rso div div[data-snhf="0"] a[href]').prop('href')
    if(check.indexOf('facebook.com') == -1){
        check = ''
    }
    worksheet['N' + String(row2)] = { t: 's', v: check}
    console.log(check)
    row2++
    XLSX.writeFile(wb, url_data); 
}

// Xử lý url label Linkedin
router.addHandler('Linkedin' , async( { request , $}) => {
    console.log(`[${utils.getCurrentDateTime()}] Processing Search Linkedin: ${request.url}`)
    let fb = getLinkedin($)
})

const getLinkedin = async ($) => {
    let check = $('#search #rso div div[data-snhf="0"] a[href]').prop('href')
    if(check.indexOf('linkedin.com') == -1){
        check = ''
        console.log(1)
    }
    worksheet['O' + String(row3)] = { t: 's', v: check}
    row3++
    XLSX.writeFile(wb, url_data);
}  