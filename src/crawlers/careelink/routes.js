import { createCheerioRouter } from "crawlee"
import * as utils from '../../../utils.js'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import { URL } from 'node:url'
import { CheerioCrawler } from 'crawlee'

// Library of time
import moment from 'moment';
import $ from 'jquery';

export const router = createCheerioRouter()

const sourceBrandname = 'careerlink'

// This route is used to retrieve all Job Posting URLs and URLs of subsequent pages
router.addDefaultHandler(async ({ crawler, request, $, enqueueLinks }) => {
    console.log(`[${utils.getCurrentDateTime()}] Processing Page Item: ${request.url}`)

    let url = new URL(request.url)

    // There are 2 ways to get links and add them to the queue. It is `with enqueueLinks` and `without enqueueLinks`
    // Read more at: https://crawlee.dev/docs/introduction/adding-urls

    // Get the list of URLs of Job Posting (with enqueueLinks)
    await enqueueLinks({ // Add links to the queue, but only from elements matching the provided selector.
        selector: '.list-group a.job-link',
        label: 'ITEM'
    })

    // Get the next page URL (without enqueueLinks)
    let nextPageId  = $('.pagination li.page-item.active').next().text().trim()
    url.searchParams.set('page', nextPageId)
    let nextPageURL = url.toString()
    await crawler.addRequests([nextPageURL])
})

// Parse data of each job posting
router.addHandler('ITEM', async ({ request, $, enqueueLinks }) => {
    console.log(`[${utils.getCurrentDateTime()}] Processing Job Item: ${request.url}`)

    // Find the JobPosting's Schema
    let schema = undefined
    try {
        schema = JSON.parse( $('script[type="application/ld+json"]').text() )
        if ( schema && (!schema.hasOwnProperty('@type') || schema['@type'] !== 'JobPosting') )
            schema = undefined
    } catch(e) {}

    let jobPosting = handleJobPosting(schema, $, request.url)
    let employer   = await handleEmployer($, jobPosting)

    let payload    = {
        employer: employer,
        job: jobPosting
    }
    
    console.log( JSON.stringify(payload) )
})

/**
 * Parsing job posting
 * @param {object}             schema [A JSON](https://schema.org/JobPosting) describing the structure of the job posting
 * @param {cheerio.CheerioAPI} $      The [Cheerio](https://cheerio.js.org/) object with parsed HTML.
 * @returns The job's payload with the format specified in the resources/schema.json 
 */
const handleJobPosting = (schema, $, sourceURL) => {
    if($('.container .job-not-found-img').length != 1){
        // Get data of Job Posting
    // Basic information that a job posting should have 
    let title           = $('.job-title').text().replace(/\n/g, '') || schema?.title
    let description     = $('.job-detail-body h5:contains("Mô tả công việc")').parent().next().html().replace(/\n/g, '')
    var index           = description.indexOf('<strong>* Quyền lợi:')
    // Có url có url không. 
    let jobBenefits     = $('.job-detail-body h5:contains("Phúc lợi")').parent().next().html() || ''

    // Một số url có quyền lợi trong phần giới thiệu.
    
    if (index != -1){
        description = description.slice(0,index)
        jobBenefits = description.substring(index)
    }  
    let skills          = $('.job-detail-body h5:contains("Kinh nghiệm / Kỹ năng chi tiết")').parent().next().html().replace(/\n/g, '')
    
    // Job's requirements
    let qualifications  = schema?.qualifications
    let experienceReq   = $('.job-detail-header .cli-suitcase-simple ').parent().text().trim()
    let educationReq    = $('#section-job-summary .summary-label:contains("Học vấn")').next().text().trim()
    let ageReq          = ''
    let genderReq       = $('#section-job-summary .summary-label:contains("Giới tính")').next().text().trim()
    let occupationalCat = schema?.occupationalCategory || $('#section-job-summary .summary-label:contains("Cấp bậc")').next().text().trim()

    // Job's Industry. 
    // It must be an array and needs to be converted the '/' characters to '-' .Eg. ['Hành chính - Văn Phòng', 'Kế toán - Kiểm toán']
    let industry        = $('#section-job-summary .summary-label:contains("Ngành nghề")').next().text().replace(/\//g, '-')
    industry            = industry.replace(/\n/g, '').split(',')

    // Posting date and expiration date
    let datePosted      = $('.job-detail-header .cli-calendar  ').parent().text().replace(/\n/g,'').replace('Ngày đăng tuyển','')
    
    // Hạn nộp (còn 23 ngày) -> 23
    let validThr_tmp    = $('.job-detail-header .cli-calendar  ').parent().next().next().text().replace(/\n/g,'').replace('Hết hạn trong:','').replace('Ngày tới','')   
    // Lấy ngày đăng + với validThr_tmp chuyển thành dạng 'dd/mm/yyyy'
    let validThrough    = moment().add(+validThr_tmp, 'days').format('DD-MM-YYYY')|| schema?.validThrough

    // Type of employment (e.g. full-time, part-time, contract, temporary, seasonal, internship).
    let employmentType  = schema?.employmentType || $('#section-job-summary .summary-label:contains("Loại công việc")').next().text().trim()

    // Hiring Organization
    let hiringOrganization = {
        name: $('.company-name-title ').text().trim() || schema?.hiringOrganization?.name ,
        address: $('#section-job-contact-information span:contains("Tên liên hệ")').parent().parent().find('.cli-location').parent().next().text().replace(/\n/g, ''),
        sameAs: schema?.hiringOrganization?.sameAs,
        logo: schema?.hiringOrganization?.logo || $('.company-logo img').attr('src'),
        numberOfEmployees: $('.company-info .cli-users ').next().text().trim()

    }

    // Job's location
    let jobLocation      = []
    let countJobLocation = 0
    if ( schema?.jobLocation !== undefined ) {
        if ( Array.isArray(schema?.jobLocation) && schema?.jobLocation.length > 0 ) {
            countJobLocation = schema?.jobLocation.length
            for (let i = 0; i < countJobLocation; i++) {
                let location = {
                    streetAddress: schema?.jobLocation[i]?.address?.streetAddress || $('.job-detail-header .cli-map-pin-line   ').parent().find('a').prev().text().trim(),
                    addressLocality: schema?.jobLocation[i]?.address?.addressLocality,
                    addressRegion: schema?.jobLocation[i]?.address?.addressRegion,
                    addressCountry: schema?.jobLocation[i]?.address?.addressCountry || 'VN'
                }
                jobLocation.push(location)
            }
        } else {
            jobLocation.push(schema?.jobLocation?.address)
        }
    } else {
        countJobLocation = $('.job-detail-header span').eq(1).find('span').length
        if ( countJobLocation > 0 ) {
            for (let i = 0; i < countJobLocation; i++) {
                let location = {
                    streetAddress: schema?.jobLocation[i]?.address?.streetAddress || $('.job-detail-header .cli-map-pin-line   ').parent().find('a').prev().text().trim(),
                    addressLocality: schema?.jobLocation[i]?.address?.addressLocality,
                    addressRegion: schema?.jobLocation[i]?.address?.addressRegion,
                    addressCountry: schema?.jobLocation[i]?.address?.addressCountry || 'VN'
                }
                jobLocation.push(location)
            }
        }
    }

    // Job's Salary
    let baseSalary = {
        currency: schema?.baseSalary?.currency,
        minValue: schema?.baseSalary?.value?.minValue,
        maxValue: schema?.baseSalary?.value?.maxValue,
        unitText: schema?.baseSalary?.value?.unitText
    }

    // The number of positions open for this job posting. Use a positive integer. Do not use if the number of positions is unclear or not known.
    let totalJobOpenings = schema?.totalJobOpenings || ''

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
        sourceLink: sourceURL,
        sourceBrandname: sourceBrandname
    }

    return jobPosting

    }
    
}

/**
 * Parsing employer
 * @param {cheerio.CheerioAPI} $ The [Cheerio](https://cheerio.js.org/) object with parsed HTML.
 * @returns The employer's payload with the format specified in the resources/schema.json 
 */
const handleEmployer = async ($, jobPosting) => {
    if($('.container .job-not-found-img').length != 1){
        let employer = utils.generateEmployerData() // A JSON object with empty data

    let employerLocation = $('.job-detail-header .cli-map-pin-line   ').parent().find('a').map((_, ele) => $(ele).text().trim()).get()

    try {
        let employerURL  = $('.company-info h5 a').prop('href')
        if (!employerURL.startsWith('http://') && !employerURL.startsWith('https://'))
            employerURL  = `https://www.careerlink.vn//${employerURL}`

        let employerResp = await fetch(employerURL)
        let respBody     = await employerResp.text()
        let $$           = $.load(respBody)
        employer.phone             = $$('#section-job-contact-information span:contains("Tên liên hệ")').parent().parent().find('.cli-phone').parent().next().text().replace(/\n/g, '')
        employer.sourceLink        = employerURL
        employer.sourceBrandname   = sourceBrandname
        employer.title             = $$('.company-header h5').text().trim() || jobPosting?.hiringOrganization?.name
        employer.location          = employerLocation
        employer.logo              = $$('.company-header .company-logo img').attr('src')|| jobPosting?.hiringOrganization.logo
        employer.website           = $$('#company-media .fas ').next().text().trim()
        employer.category          = jobPosting?.industry
        employer.address           = $$('.company-summary  .cli-map-pin-line  ').next().text().trim() || jobPosting?.hiringOrganization.address
        employer.numberOfEmployees = $$('.company-summary  .cli-users   ').next().text().trim() || jobPosting?.hiringOrganization.numberOfEmployees
        employer.description       = $$('.company-description .text-collapse .text-collapse--content').html().trim() || $('.box-info .content').html()
    } catch (e) {
        console.log(e)
    }

    return employer
    }
     
}

