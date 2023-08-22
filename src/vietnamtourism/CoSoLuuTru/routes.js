import { createCheerioRouter } from "crawlee"
import * as utils from './../utils.js'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import { URL } from 'node:url'
import XLSX from "xlsx"
export const router = createCheerioRouter()

var workbook = XLSX.readFile("./du-lieu-khach-san.xlsx");

const sourceBrandname   = 'vietnamtourism'
const type              = 'Cơ sở lưu trú'
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
    url.searchParams.set('page', nextPageId)
    let nextPageURL = url.toString()
    // let nextPageURL = 'https://csdl.vietnamtourism.gov.vn/cslt/?page=' + String(nextPageId)
    await crawler.addRequests([nextPageURL])
})

// Parse data of each job posting
router.addHandler('ITEM', async ({ request, $, enqueueLinks }) => {
    console.log(`[${utils.getCurrentDateTime()}] Processing AccommodationFacility Item: ${request.url}`)

    let AccommodationFacility   = utils.generateAccommodationFacilityData
    try {
        AccommodationFacility.type              = type
        AccommodationFacility.category          = $('.container .container-fluid .fa-bed ').parent().eq(0).text().trim()??''
        AccommodationFacility.title             = $('.container .container-fluid h4 a').text() || ''
        AccommodationFacility.evaluate          = ($('.container .container-fluid .fa-bed').next().attr('src')??'0star').split('/').pop().replace('.png','')
        AccommodationFacility.address           = $('.container .container-fluid .fa-map-marker ').parent().text().trim().split(':')[1]?? ''
        AccommodationFacility.phone             = String($('.container .container-fluid .fa-phone ').parent().map( (_, ele) => $(ele).text().trim() ).get())?? ''
        AccommodationFacility.email             = $('.container .container-fluid .fa-envelope-o').parent().text().trim().split(':')[1]?? ''
        AccommodationFacility.website           = $('.container .container-fluid .fa-globe ').parent().text().trim().split('e:')[1]?? ''
        AccommodationFacility.roomNumber        = $('.container .container-fluid .fa-bed ').parent().text().trim().split(':')[1]?? ''
        AccommodationFacility.minPrice          = $('.container .container-fluid .fa-money').parent().text().trim().replace('Giá:', '').split('-')[0]??''
        AccommodationFacility.maxPrice          = $('.container .container-fluid .fa-money').parent().text().trim().replace('Giá:', '').split('-')[1]??''
        AccommodationFacility.censorship        = $('.container .container-fluid .fa-check-square-o ').parent().text().trim()?? ''
        AccommodationFacility.utilities         = String($('.container .container-fluid .col-12  .d-block span img ').map( (_, ele) => $(ele).attr('alt') ).get())
        AccommodationFacility.logo              = $('.container .container-fluid .listing-items img').attr('src')
        AccommodationFacility.description       = $('.container .container-fluid .col-12 p').text()
        AccommodationFacility.url               = String(request.url)
        AccommodationFacility.sourceBrandname   = sourceBrandname

        var ws = workbook.Sheets["DuLieuKhachSan"];
        var range = XLSX.utils.decode_range(ws['!ref']);
        var lastRow = range.e.r;
        XLSX.utils.sheet_add_json(ws, [AccommodationFacility], {header: ["type", "category", "title", "evaluate", "address", "phone", "email", "website", "roomNumber", "minPrice", "maxPrice", "censorship", "utilities", "logo", "description", "url", "sourceBrandname"], skipHeader: true, origin: lastRow+1});
        XLSX.writeFile(workbook, "du-lieu-khach-san.xlsx")
        console.log(lastRow)
        
    } catch (error) {
        console.log(e)
    }
    // console.log((AccommodationFacility.type).type)
        return AccommodationFacility
})