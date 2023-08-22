import { CheerioCrawler } from 'crawlee'
import { router } from './routes_gg.js'

import $ from 'jquery';
const crawler = new CheerioCrawler({
    // maxRequestsPerCrawl: 4,
    maxConcurrency: 4,
    maxRequestsPerMinute: 5,
    requestHandler: router
    
})
await crawler.run([
    'https://www.google.com/search?q=%22email%22+goldmark+oakham'
])