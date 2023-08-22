import { createPlaywrightRouter, playwrightUtils } from "crawlee"
import * as utils from '../../../utils.js'
import * as playwright from 'playwright'
import { URL } from 'node:url'

export const router = createPlaywrightRouter()

// This route is used to retrieve all Job Posting URLs and URLs of subsequent pages
router.addDefaultHandler(async ({ crawler, page, enqueueLinks, parseWithCheerio }) => {
    console.log(`[${utils.getCurrentDateTime()}] Processing Page Item: ${page.url()}`)

    let requestURL = new URL( page.url() )
    let hostname   = requestURL.origin 

    // Scroll until bottom of page to load all the content
    await playwrightUtils.infiniteScroll( page, { 
        timeoutSecs: 0
    });

    // Get the list of URLs of Job Posting
    let links      = page.locator('.job-item-container a.job-title')
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

    // Get the next page URL and add to the request queue
    let pagination = page.locator('.pagination')
    if ( await pagination.count() > 0 ) {
        let activePageLocator = pagination.locator('.page-item.active')
        if ( await activePageLocator.count() > 0 ) {
            let pageId     = await activePageLocator.innerText() // Current page id
            let nextPageId = parseInt(pageId) + 1;
            if ( !isNaN(nextPageId) ) {
                let nextPageLocator = pagination.locator('.page-item', { hasText: nextPageId }).first()
                if ( await nextPageLocator.count() > 0 ) {
                    requestURL.searchParams.set('page', nextPageId)
                    let nextPageURL = requestURL.toString()
                    await crawler.addRequests([nextPageURL])
                }
            }
        }
    }

    // Close the page after processing
    await page.close()
})

// Parse data of each job posting
router.addHandler('ITEM', async ({ page }) => {
    console.log(`[${utils.getCurrentDateTime()}] Processing Job Item: ${page.url()}`)

    let jobPosting = await handleJobPosting( page )
    let employer   = await handleEmployer( page, jobPosting )

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
const handleJobPosting = async (page) => {
    // Find the JobPosting's Schema
    let schema = undefined
    try {
        schema = await page.locator('script[type="application/ld+json"]').textContent()
        schema = JSON.parse( schema )
        if ( schema && (!schema.hasOwnProperty('@type') || schema['@type'] !== 'JobPosting') )
            schema = undefined
    } catch(e) {
        console.log(e)
    }

    // Get data of Job Posting
    // Basic information that a job posting should have
    let title           = schema?.title || await page.locator('.page-job-detail__header .job-header-info h1.job-title').textContent()
    let description     = await page.locator('.job-description .description').innerHTML()
    let jobBenefits     = ''
    let skills          = await page.locator('.job-requirements .requirements').innerHTML()

    // Job's requirements
    let qualifications  = schema?.qualifications
    let experienceReq   = undefined
    let educationReq    = undefined
    let ageReq          = undefined
    let genderReq       = undefined
    let occupationalCat = ( await page.getByText('Cấp Bậc').locator('..').locator('.content').textContent() || '' ).trim()

    // Job's Industry
    let industry        = schema?.industry || await page.getByText('Ngành Nghề').locator('..').locator('.content').getByRole('link').allInnerTexts()
    if ( industry ) {
        if ( typeof industry === 'string' ) {
            industry = industry.split(',').map(item => item.trim())
        } else if ( Array.isArray( industry ) ) {
            industry.forEach((item, index) => {
                industry[index] = item.split('/').map((item) => item.trim()).join(' - ')
            }) 
        }
    }

    // Posting date and expiration date
    let datePosted      = schema?.datePosted || 
                          ( await page.getByText('Ngày Đăng Tuyển').locator('..').locator('.content').textContent() || '' ).trim() // `..` is the syntax to get the parent element from the selected element
    let validThrough    = schema?.validThrough

    // Type of employment
    let employmentType  = schema?.employmentType

    // Hiring Organization
    let hiringOrganization = {
        name: schema?.hiringOrganization?.name || await page.locator('.page-job-detail__header .company-name .name').textContent(),
        address: '',
        sameAs: schema?.hiringOrganization?.sameAs || await page.locator('.page-job-detail__header .company-name').getByRole('link').getAttribute('href'),
        logo: schema?.hiringOrganization?.logo || await page.locator('.page-job-detail__header .logo-wrapper').getByRole('img').getAttribute('src'),
        numberOfEmployees: ''
    }
    
    // Job's location
    let jobLocation = await handleJobLocation(page, schema)     

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
        sourceLink: page.url(),
        sourceBrandname: 'vietnamworks'
    }

    return jobPosting
}

/**
 * Parsing Job Location
 * @param {playwright.Page} page   An instance of the Playwright [Page](https://playwright.dev/docs/api/class-page)
 * @param {object}          schema [A JSON](https://schema.org/JobPosting) describing the structure of the job posting
 * @returns 
 */
const handleJobLocation = async (page, schema) => {
    // Get the list of localities from job-detail's header.
    let localities  = await page.locator('.page-job-detail__header .job-header-info .company-location').getByRole('link').allInnerTexts()
    if (localities && localities.length > 0)
        localities = localities.map((item) => item.trim())

    // Get the list of addresses
    let addresses = await page.locator('.job-locations .location').allInnerTexts()
    if (addresses && addresses.length > 0)
        addresses = addresses.map((item) => item.trim())

    // In the Job Posting JSON Schema of the Vietnamworks website, the JobLocation value represents only one location, while the information on the website can be more than one.
    // To handle JobLocation, we get 2 arrays of work locations and addresses.
    // Usually the index of the `addresses` array corresponds to the index of the `localities` array

    // Locations
    let locations = []
    addresses.forEach((item, index) => {
        if ( index === 0 ) {
            locations.push(schema?.jobLocation?.address)
        } else {
            let location = {
                streetAddress: item,
                addressLocality: localities[index],
                addressRegion: localities[index],
                addressCountry: 'VN'
            }
            locations.push(location)
        }
    })

    return locations
}

/**
 * Parsing employer
 * @param {playwright.Page} page       An instance of the Playwright [Page](https://playwright.dev/docs/api/class-page)
 * @param {object}          jobPosting 
 * @returns 
 */
const handleEmployer = async (page, jobPosting) => {
    let employer = utils.generateEmployerData() // A JSON object with empty data

    try {
        // Click the tab Company Info for all element to be visible
        await page.locator('.page-job-detail__detail a[href="#company-info"]').click()

        // Location
        let localities  = await page.locator('.page-job-detail__header .job-header-info .company-location').getByRole('link').allInnerTexts()
        if (localities && localities.length > 0) {
            localities = localities.map((item) => item.trim())
            employer.location = localities
        }

        // Logo
        employer.logo = jobPosting?.hiringOrganization.logo

        // Category
        employer.category = jobPosting?.industry

        // Description
        if ( await page.locator('#company-info .company-info').isVisible() ) {
            employer.description = await page.locator('#company-info .company-info').first().innerHTML()
        } else if ( await page.locator('#company-info .company-info__description-text').isVisible() ) {
            employer.description = await page.locator('#company-info .company-info__description-text').first().innerHTML()
        }

        // Address
        if ( await page.locator('#company-info').getByText('Địa Điểm').isVisible() ) {
            employer.address = await page.locator('#company-info').getByText('Địa Điểm').locator('..').locator('.content').textContent()
        }

        // Number of employees
        if ( await page.locator('#company-info').getByText('Quy Mô Công Ty').isVisible() ) {
            employer.numberOfEmployees = await page.locator('#company-info').getByText('Quy Mô Công Ty').locator('..').locator('.content').textContent()
        }

        // Select the "View All Profiles" button
        if ( await page.locator('.view-company-profile').isVisible() ) {
            let employerURL = await page.locator('.view-company-profile').getAttribute('href') 
            employer.sourceLink      = employerURL
            employer.sourceBrandname = 'vietnamworks'

            await page.goto(employerURL)

            // Title
            employer.title   = await page.locator('#cp_company_name').textContent()

            // Website
            if ( await page.locator('.website-company').isVisible() )
                employer.website = await page.locator('.website-company').textContent() 
        }
    } catch (e) {
        console.log(e)
    }

    return employer
}