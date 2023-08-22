import { CheerioCrawler } from 'crawlee'
import { router } from './routes.js'

const crawler = new CheerioCrawler({
    // To understand the meaning of the below options and see all available options, you can see more at: 
    // https://crawlee.dev/api/cheerio-crawler/interface/CheerioCrawlerOptions

    // You should uncomment the below line when running on development environment and modify the value to satisfy your needs.
    // maxRequestsPerCrawl: 3, // Stop crawling after several pages

    // The default options are used in all different crawlers, which you can modify to suit your needs.
    // maxConcurrency: 2,
    // maxRequestsPerMinute: 5,
    requestHandler: router
})

await crawler.run([
    'http://csdl.vietnamtourism.gov.vn/rest?page=116',
])