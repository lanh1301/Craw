import { PlaywrightCrawler } from 'crawlee'
import { router } from './routes.js'

const crawler = new PlaywrightCrawler({
    // 
    launchContext: {
        // Here you can set options that are passed to the playwright .launch() function.
        // You can read more at: https://playwright.dev/docs/api/class-browsertype#browser-type-launch
        launchOptions: {
            headless: false,
            slowMo: 2000
        }
    },

    // You should uncomment the below line when running on development environment and modify the value to satisfy your needs.
    // maxRequestsPerCrawl: 2, // Stop crawling after several pages
    requestHandler: router,
    maxConcurrency: 2,
    maxRequestsPerMinute: 5,
    requestHandlerTimeoutSecs: 300
})

await crawler.run([
    'https://www.vietnamworks.com/tim-viec-lam/tat-ca-viec-lam'
])
// https://www.vietnamworks.com/senior-full-stack-lead-java-nodejs-reactjs-1-1-1-1620529-jv/?source=searchResults&searchType=2&placement=1620530&sortBy=date
// https://www.vietnamworks.com/business-development-executive-444-1620556-jv/?source=searchResults&searchType=2&placement=1620557&sortBy=date
// https://www.vietnamworks.com/physical-design-engineer-work-location-taiwan-2-2-1-1-1-1-1-1618572-jv/?source=searchResults&searchType=2&placement=1618573&sortBy=date