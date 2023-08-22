import { PlaywrightCrawler } from 'crawlee'
import { router } from './routes_ctt.js'

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
    requestHandlerTimeoutSecs: 100000
})

await crawler.run([
    'https://www.google.com/maps/'
])