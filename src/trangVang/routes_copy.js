import { createCheerioRouter, keys } from "crawlee"
import * as utils from './../utils.js'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import { URL } from 'node:url'
import validator  from 'validator'
import dns from 'dns'
export const router = createCheerioRouter()

const sourceBrandname = 'TrangVang'
let company = utils.generateEmployerDataTrangVang()
// This route is used to retrieve all Job Posting URLs and URLs of subsequent pages
router.addDefaultHandler(async ({ crawler, request, $, enqueueLinks }) => {
    console.log(`[${utils.getCurrentDateTime()}] Processing Page Item: ${request.url}`)

    let url = new URL(request.url)


    await enqueueLinks({
        selector: '#listingsearch .boxlistings h2 a',
        label : 'ITEM'
    })
    if ($('#contentglobals #paging .page_active').eq(1).next().text() != 'Tiếp'){
        if($('#contentglobals #paging .page_active').eq(1).next().text() == '...')
            nextPageId = $('#contentglobals #paging .page_active').eq(1).next().next().text()
        else 
            nextPageId = $('#contentglobals #paging .page_active').eq(1).next().text()
        url.searchParams.set('page', nextPageId)
        let nextPageURL = url.toString()
        await crawler.addRequests([{url: nextPageURL, label:'ITEM'}])
        console.log(nextPageURL)
    }
    company.category        = $('#listingsearch #thongbaotim h1').text()
    
})

// Parse data of each job posting
router.addHandler('ITEM', async ({ crawler,request, $, enqueueLinks }) => {
    console.log(`[${utils.getCurrentDateTime()}] Processing Job Item: ${request.url}`)


    let summary = $('[name="description"]').attr('content')

    company.title           = summary.split('/')[0] || $('#contentglobals .tencongty').text()
    company.address         = summary.slice(summary.indexOf(': ') + 2 , summary.indexOf(', Điện thoại:')) || $('#contentglobals .diachi_chitiet_li1:contains("Đ/c:")').next().text().trim().replace(/\  /g,'') || ''
    company.logo            = $('#listing_detail_left #listing_basic_info .picRind img').attr('src') || ''
    company.location        = $('#contentglobals .diachi_chitiet_li1:contains("Đ/c:")').next().find('em').text().replace(/\  /g,'') ||''
    company.phone           = $('#contentglobals .diachi_chitiet_li1:contains("Tel:")').next().text().trim().split(',') || ''
    company.fax             = summary.slice(summary.indexOf('fax:'),summary.indexOf(', Email')).replace('fax:','') || $('#contentglobals .diachi_chitiet_li1:contains("Fax:")').next().text().trim().split(',') || ''
    company.email           = summary.slice(summary.indexOf('Email:'),summary.indexOf(', website')).replace('Email:','').trim() || $('#contentglobals .text_email').text().trim() || ''
    company.website         = summary.slice(summary.indexOf('website:')).replace('website:', '').trim() || $('#contentglobals .text_website').text().trim() || ''
    company.description     = $('.thongtinchitiet .gioithieucongty').html() || ''
    company.industry        = $('.thongtinchitiet .nganhnghe_chitiet_li .nganhgnhe_chitiet_text a').map( (_, ele) => $(ele).text().trim() ).get() || ''
    company.serviceProduction = $('.thongtinchitiet .daumuc_tuade_chitiet:contains("Sản phẩm")').next().find('a').map( (_, ele) => $(ele).text().trim() ).get() || ''
    company.companyType     = $('#contentglobals .thitruong_loaidn_title_txt:contains("Loại hình công ty:")').parent().next().text().trim() || ''
    // company.imgage          = $('#listing_detail_left .thongtinchitiet:contains("THƯ VIỆN HÌNH ẢNH") .tennhomhinhanh:contains("Túi xách thời trang")') .map( (_, ele) => $(ele).next().find('.pic a').attr('href')).get()
    
    
    
    company.imgage          = $('#listing_detail_left .thongtinchitiet:contains("THƯ VIỆN HÌNH ẢNH") .productList').map((_,ele)=> $(ele).find('.pic a[href]').map((_,ele) => $(ele).prop('href')).get()).get()
    
    company.mainMarketing   = $('#contentglobals .thitruong_loaidn_title_txt:contains("Thị trường chính:")').parent().next().text().trim() || ''
    company.taxCode         = $('.thongtinchitiet .hosocongty_li .hosocongty_tite_text:contains("Mã số thuế")').parent().next().text() || ''
    company.foundedYear     = $('.thongtinchitiet .hosocongty_li .hosocongty_tite_text:contains("Năm thành lập")').parent().next().text() || ''
    company.numberOfEmployees = $('.thongtinchitiet .hosocongty_li .hosocongty_tite_text:contains("Số lượng nhân viên")').parent().next().text().trim() || ''
    company.certification   = $('.thongtinchitiet .hosocongty_li .hosocongty_tite_text:contains("Chứng nhận")').parent().next().text() || ''
    company.sourceLink = request.url
    company.sourceBrandname = sourceBrandname

    if (company.email != ''){
        if (validator.isEmail(company.email)){
            // Kiểm tra email có tồn tại không
            const domain = company.email.split('@')[1]
            dns.resolveMx(domain, (err, addresses) => {
                if (err) 
                    company.email_valid = 'False'
                else
                    company.email_valid = 'True'
                
        })}
    }
   console.log(company)
})

