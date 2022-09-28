'use strict'

const config = require('../../config')
const fetch = require('node-fetch')

class ActivityModel {
  constructor() {
    this.api = config.get('CKAN_PAGES_URL')
  }

  // returns promise
  async getPackageActivity(pkg,limit) {
   const url = `${this.api}package_activity_list?id=${pkg}&limit=${limit}`
   const res = await fetch(url)
   if (res.ok) {
     const activity = await res.json()
     if (activity.result) {
       return activity.result
     } else {
       throw {statusCode: 404}
     }
   } else {
     const message = await res.text()
     console.warn(message)
     throw {statusCode: res.status, message}
   }
  }
  
  // returns promise
  async getCollectionActivity(collection,limit) {
   const url = `${this.api}group_activity_list?id=${collection}&limit=${limit}`
   const res = await fetch(url)
   if (res.ok) {
     const activity = await res.json()
     if (activity.result) {
       return activity.result
     } else {
       throw {statusCode: 404}
     }
   } else {
     const message = await res.text()
     console.warn(message)
     throw {statusCode: res.status, message}
   }
  }

}

module.exports.ActivityModel = ActivityModel
