import { CheerioCrawler } from 'crawlee'
import { router } from './routes_gg.js'

import $ from 'jquery';
const crawler = new CheerioCrawler({
    // To understand the meaning of the below options and see all available options, you can see more at: 
    // https://crawlee.dev/api/cheerio-crawler/interface/CheerioCrawlerOptions

    // You should uncomment the below line when running on development environment and modify the value to satisfy your needs.
    // maxRequestsPerCrawl: 4, // Stop crawling after several pages

    // The default options are used in all different crawlers, which you can modify to suit your needs.
    maxConcurrency: 6,
    maxRequestsPerMinute: 6,
    requestHandler: router
    
})
await crawler.run([
    'https://www.google.com/search?q=masothue.com+Công Ty Tnhh Goldmark Oakham'
])