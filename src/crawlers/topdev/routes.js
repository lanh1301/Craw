import { createPlaywrightRouter, playwrightUtils } from "crawlee"
import * as utils from '../../../utils.js'
import * as playwright from 'playwright'
import fetch from 'node-fetch'
import { URL } from 'node:url'

export const router = createPlaywrightRouter()

// This route is used to retrieve all Job Posting URLs and URLs of subsequent pages
router.addDefaultHandler(async ({ crawler, page, enqueueLinks, parseWithCheerio }) => {
    console.log(`[${utils.getCurrentDateTime()}] Processing Page Item: ${page.url()}`)

    let requestURL = new URL( page.url() )
    let hostname   = requestURL.origin 

    // Scroll until bottom of page to load all the content
    // await playwrightUtils.infiniteScroll( page, { 
    //     timeoutSecs:0
    // });

    // Get the list of URLs of Job Posting
    let links      = page.locator('.list__job #scroll-it-jobs h3 a')
    let linksCount = await links.count()
    for (let i = 0; i < linksCount; i++) {
        let url = await links.nth(i).getAttribute('href')
        if ( url ) {
            if ( !url.startsWith('http://') && !url.startsWith('https://') ) // Add hostname for url if not exist 
                url = hostname + url

            // Add the URL to the request queue
            await crawler.addRequests([ { url: url, label: 'ITEM' } ])
        }
    }
    await page.pause()
})

// // Parse data of each job posting
router.addHandler('ITEM', async ({ page , parseWithCheerio}) => {
    console.log(`[${utils.getCurrentDateTime()}] Processing Job Item: ${page.url()}`)

    let pageURL        = page.url()
    const $        = await parseWithCheerio(page)
    let jobPosting = await handleJobPosting( $, pageURL )
    let employer   = await handleEmployer( $  , jobPosting )

    
    jobPosting.hiringOrganization.address = employer.address
    jobPosting.hiringOrganization.numberOfEmployees = employer.numberOfEmployees

    let payload = {
        employer: employer,
        jobPosting: jobPosting
    }

    console.log( JSON.stringify(payload) )
})

/**
 * Parsing job posting
 * @param {playwright.Page} page An instance of the Playwright [Page](https://playwright.dev/docs/api/class-page)
 * @returns The job's payload with the format specified in the resources/schema.json 
 */
const handleJobPosting = async ($, pageURL) => {
    // Find the JobPosting's Schema
    let schema = undefined
    try {
        schema = JSON.parse( $('script[type="application/ld+json"]').eq(0).text() )
        if ( schema && (!schema.hasOwnProperty('@type') || schema['@type'] !== 'JobPosting') )
            schema = undefined
    } catch(e) {}
    // Get data of Job Posting
    // Basic information that a job posting should have
    let title           = schema?.title || $('#about_company h1').text().trim()
    let description     = $('#about_company h2:contains("Trách nhiệm công việc:")').next().html()
    let jobBenefits     = $('.rightside .card h2:contains("Phúc lợi dành cho bạn")').next().text().replace(/\n/g, '')
    let skills          = $('#about_company h2:contains("Kỹ năng & Chuyên môn:")').next().html()

    // Job's requirements
    let qualifications  = schema?.qualifications
    let experienceReq   = $('.right-cont h3:contains("Số năm kinh nghiệm")').next().text()
    let educationReq    = undefined
    let ageReq          = undefined
    let genderReq       = undefined
    let occupationalCat = $('.right-cont h3:contains("Cấp bậc")').next().text()

    // // Job's Industry
    let industry        = schema?.industry?.split(',').map(item => item.trim()) || $('.rightside .card .tag-list span').map((_, ele) => $(ele).text()).get()
    // Posting date and expiration date
    let datePosted      = schema?.datePosted
    let validThrough    = schema?.validThrough

    // Type of employment
    let employmentType  = schema?.employmentType || $('.right-cont h3:contains("Loại hình")').next().text()

    // Hiring Organization
    let hiringOrganization = {
        name: schema?.hiringOrganization?.name || await $('.about-comp .cont p').text().trim().split('\n')[0],
        address: $('.rightside .card .list-addresses li').text().trim().replace(/\  /g,'').split('\n\n')|| '',
        sameAs: schema?.hiringOrganization?.sameAs || $('.about-comp .cont a[href]').prop('href'),
        logo: schema?.hiringOrganization?.logo || $('.about-comp .img img').attr('src'),
        numberOfEmployees: ''
    }
    
    // Job's location
    let jobLocation = schema?.jobLocation?.address

    // Job's salary
    let baseSalary = {
        currency: schema?.baseSalary?.currency,
        minValue: schema?.baseSalary?.value?.minValue,
        maxValue: schema?.baseSalary?.value?.maxValue,
        unitText: schema?.baseSalary?.value?.unitText
    }

    // Total Job Openings
    let totalJobOpenings = undefined

    // Output
    let jobPosting = {
        title: title,
        description: description,
        jobBenefits: jobBenefits,
        skills: skills,
        qualifications: qualifications,
        experienceRequirements: experienceReq,
        educationRequirements: educationReq,
        ageRequirements: ageReq,
        genderRequirements: genderReq,
        occupationalCategory: occupationalCat,
        industry: industry,
        datePosted: datePosted,
        validThrough: validThrough,
        employmentType: employmentType,
        hiringOrganization: hiringOrganization,
        jobLocation: jobLocation,
        baseSalary: baseSalary,
        totalJobOpenings: totalJobOpenings,
        sourceLink: pageURL,
        sourceBrandname: 'topdev'
    }
    return jobPosting
}



/**
 * Parsing employer
 * @param {playwright.Page} page       An instance of the Playwright [Page](https://playwright.dev/docs/api/class-page)
 * @param {object}          jobPosting 
 * @returns 
 */
const handleEmployer = async ($, jobPosting) => {
    let employer = utils.generateEmployerData() // A JSON object with empty data
    
    try {
        // Click the tab Company Info for all element to be visible
        let employerURL  = $('.navi .navi-left-item a[href]').prop('href')
        let employerResp = await fetch(employerURL)
        let respBody     = await employerResp.text()
        let $$           = $.load(respBody)

        let schema = undefined
        try {
            schema = JSON.parse( $$('script[type="application/ld+json"]').eq(0).text() )
            if ( schema && (!schema.hasOwnProperty('@type') || schema['@type'] !== 'LocalBusiness') )
                schema = undefined
        } catch(e) {}

        // Location
        let localities              = String($$('.rightside .card h3:contains("Địa điểm")').next().text().replace(/\  /g, '').trim().split('\n\n'))
        var regex                   = /Thành phố\s+([\p{L}\s]+)/ug
        var matches                 = localities.match(regex).map(m => m.replace(/Thành phố\s+/ug, ''))
        localities                  = matches
        employer.location           = localities
        employer.phone              = schema?.telephone || ''
        // Logo
        employer.logo               = jobPosting?.hiringOrganization.logo

        // // Category
        employer.category           = jobPosting?.industry

        // Description
        employer.description        = schema?.description || $$('.company-content #slide-wrap-length .left-cont').html().replace(/\  /g, '').trim()

        // // Address
        employer.address            = $$('.rightside .card h3:contains("Địa điểm")').next().text().replace(/\  /g, '').trim().split('\n\n')

        // // Number of employees
        employer.numberOfEmployees  = $$('.rightside .card h3:contains("Quy mô công ty")').next().text().trim()

        // Select the "View All Profiles" button
        employer.sourceLink         = employerURL
        employer.sourceBrandname    = 'topdev'

        // Title
        employer.title   = $$('.leftside .about-comp h1').text().trim()

        // Website
        employer.website = $$('.rightside .card .clearfix  a[href]').prop('href')
        
    } catch (e) {
        console.log(e)
    }

    return employer
}