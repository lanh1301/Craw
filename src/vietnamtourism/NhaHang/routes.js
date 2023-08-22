import { createCheerioRouter } from "crawlee"
import * as utils from './../utils.js'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import { URL } from 'node:url'
import XLSX from "xlsx"
export const router = createCheerioRouter()

var workbook = XLSX.readFile("./du-lieu-nha-hang.xlsx");

const sourceBrandname = 'vietnamtourism'
const type              = 'Nhà Hàng'

// This route is used to retrieve all Job Posting URLs and URLs of subsequent pages
router.addDefaultHandler(async ({ crawler, request, $, enqueueLinks }) => {
    console.log(`[${utils.getCurrentDateTime()}] Processing Page Item: ${request.url}`)

    let url = new URL(request.url)

    // There are 2 ways to get links and add them to the queue. It is `with enqueueLinks` and `without enqueueLinks`
    // Read more at: https://crawlee.dev/docs/introduction/adding-urls

    // Get the list of URLs of Job Posting (with enqueueLinks)
    await enqueueLinks({ // Add links to the queue, but only from elements matching the provided selector.
        selector: '.container .cslt-items h4 a[href]',
        label: 'ITEM'
    })

    // Get the next page URL (without enqueueLinks)
    let nextPageId  = $('.container .pagination li.active').next().text()
    // url.searchParams.set('', nextPageId)
    // let nextPageURL = url.toString()
    let    nextPageURL = 'http://csdl.vietnamtourism.gov.vn/rest?page=' + String(nextPageId)
    
    console.log(nextPageURL)
    await crawler.addRequests([nextPageURL])
})

// Parse data of each job posting
router.addHandler('ITEM', async ({ request, $, enqueueLinks }) => {
    console.log(`[${utils.getCurrentDateTime()}] Processing Restaurant Item: ${request.url}`)
    let restaurant = utils.generateRestaurantData
    try {
        restaurant.type             = type
        restaurant.title            = $('.container .container-fluid h4 a').text()?? ''
        restaurant.address          = $('.container .container-fluid .fa-map-marker ').parent().text().trim().split(':')[1]?? ''
        restaurant.phone            = $('.container .container-fluid .fa-phone ').parent().text().trim().split(':')[1]?? ''
        restaurant.email            = $('.container .container-fluid .fa-envelope-o').parent().text().trim().split(':')[1]?? ''
        restaurant.website          = $('.container .container-fluid .fa-globe ').parent().text().trim().split(':')[1]?? ''
        restaurant.description      = $('.container .content-detail').html().trim()??'' + $('.container .content-detail p').html().trim()??''
        restaurant.Timeserver       = $('.container .col-md').text()?? ''
        restaurant.BusinessHours    = $('.container  label[for*=time1]').text().split('a:')[1]?? ''
        restaurant.CloseTime        = $('.container  label[for*=time2]').text().split('a:')[1]?? ''
        restaurant.url              = String(request.url)
        restaurant.sourceBrandname  = sourceBrandname

        var ws = workbook.Sheets["DuLieuNhaHang"];
        var range = XLSX.utils.decode_range(ws['!ref']);
        var lastRow = range.e.r;
        XLSX.utils.sheet_add_json(ws, [restaurant], {header: ["type", "title", "address", "phone", "email", "website",  "description", "Timeserver", "BusinessHours", "CloseTime", "url", "sourceBrandname"], skipHeader: true, origin: lastRow+1});
        XLSX.writeFile(workbook, "./du-lieu-nha-hang.xlsx")
    } catch (error) {
        console.log(e)
    }
    
})