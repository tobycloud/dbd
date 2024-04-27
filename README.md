# Discord Activity: Getting Started Guide

This template is used in the [Building An Activity](https://discord.com/developers/docs/activities/building-an-activity) tutorial in the Discord Developer Docs.

Read more about building Discord Activities with the Embedded App SDK at [https://discord.com/developers/docs/activities/overview](https://discord.com/developers/docs/activities/overview).

## How to run
+ 1. Install server dependencies and start server
```sh
cd server/
npm i 
node server
```


+ 2. Install client dependencies and start serving client files
```sh
cd client
npm i 
npm run dev
```

or 

**Use CloudFlare Pages to build your app**

+ you will need to expose client port to the internet by using cloudflare tunnel or ngrok
+ config app on the developer portal
+ enjoy