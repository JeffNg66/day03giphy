// load libraries
const express = require('express')
const handlebars = require('express-handlebars')
const fetch = require('node-fetch')
const withQuery = require('with-query').default

// configure Port & Environment
const PORT = parseInt(process.argv[2]) || parseInt(process.env.MY_PORT) || 3000
const API_KEY = process.env.API_KEY || ''
const EndPoint = 'https://api.giphy.com/v1/gifs/search'
//const Api_Key = 'J6Wvfhgo4sPHPHYJkue9CAx82vGXxRV9'
// set API_KEY=...... in command terminal no ''

// create an instance
const app = express()

// configure handlebars
app.engine('hbs', handlebars({defaultLayout: 'default.hbs'}))
app.set('view engine', 'hbs')


// configure application
//app.use(express.static(__dirname + ''))

// configure app
app.get('/', (req, resp) => {
    resp.status(200)
    resp.type('text/html')
    resp.render('index')
})
/*
https://api.giphy.com/v1/gifs/search
    ?api_key=J6Wvfhgo4sPHPHYJkue9CAx82vGXxRV9&q=
    &limit=25
    &offset=0
    &rating=g
    &lang=en
*/
app.get('/search', 
    async (req, resp) => {
        //const search = req.query['search-term']
        const search = req.query.search_term
        //console.info('search-term: ', search)
        const url = withQuery(
            EndPoint,
            {
                api_key: API_KEY,
                q: search,
                limit:  5
            }
        )

        console.info(url)
        let result = await fetch(url)

        try {
            const giphys = await result.json()
            console.info(giphys)
            
            /*
            const imgs =[]
            for (let d of giphys.data) {
                const title = d.title // d['title'] will not give error if title is not available
                const url = d.images.fixed_height.url // d['images']['fixed_heights']['url']
                imgs.push({title, url})  // {title: title, url: url}
            }
            */
            const imgs = giphys.data
                .filter(
                    v => {
                        return !v.title.includes('f**k')
                    }
                )
                .map(
                    v => {
                    return { title: v.title, url: v.images.fixed_height.url}
                })
                console.info(imgs)
                resp.status(200)
                resp.type('text/html')
                resp.render('search', {
                    search, imgs,
                    hasContent: !!imgs.length  // !! convert to true / false boolean
                })
        } catch(e) {
            console.error('Async Error ', e)
            return Promise.reject(e)
        }

        
        

})

// start server
if (API_KEY) {
    app.listen(PORT, () => { 
        console.info(`Application started on Port ${PORT} at ${new Date()}`)
        console.info(`API_KEY is ${API_KEY}`)
    })
}
else
    console.error('API_KEY is not set')

