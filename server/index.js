const Koa = require('koa')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
import { resolve } from 'path'
const R = require('ramda')

const config = require('../nuxt.config.js')
config.dev = process.env !== 'production'

const r = path => resolve(__dirname, path)
const MIDDLEWARES = ['database','router']

class Server {
  constructor () {
    this.app = new Koa()
    this.useMiddleWares(this.app)(MIDDLEWARES)
  }  
  useMiddleWares (app) {
    return R.map(R.compose(
      R.map(i => i(app)),
      require,
      i => `${r('./middlewares')}/${i}`
    ))
  } 
  
  async start () {
    
    const nuxt = new Nuxt(config)
  
    const {
      host = process.env.HOST || '127.0.0.1',
      port = process.env.PORT || 3000
    } = nuxt.options.server
    
    await nuxt.ready()
    // Build in development
    if (config.dev) {
      const builder = new Builder(nuxt)
      await builder.build()
    }
    
    this.app.use((ctx) => {
      ctx.status = 200
     // ctx.respond = false // Bypass Koa's built-in response handling
     // ctx.req.ctx = ctx // This might be useful later on, e.g. in nuxtServerInit or with nuxt-stash
      nuxt.render(ctx.req, ctx.res)
    })
    
    this.app.listen(port, host)
    consola.ready({
      message: `Server listening on http://${host}:${port}`,
      badge: true
    })
  }
}

const server = new Server()
server.start()
