const puppeteer = require('puppeteer');


const self = {
    browser: null,
    page: null,

    initialize: async (withoutChromium) => {

        self.browser = await puppeteer.launch({
            headless: withoutChromium,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            userDataDir: './data',
            ignoreDefaultArgs: ['--disable-extensions']
        });
        self.page = await self.browser.newPage()
    },

    goToLogInPage: async (link, number, password) => {
        await self.page.goto(link, {waitUntil: 'networkidle0', timeout: 0});
        await self.page.evaluate( async (number, password) => {
            document.querySelector('[class="input-block-level hint--bottom hint--info hint--rounded"]').value = number;
            document.querySelector('[id="password"]').value = password;
            document.querySelector('[id="passreminder"]').parentElement.querySelector('[class="btn bluebtn"]').click()

        }, number, password);
        await self.page.waitForNavigation({waitUntil: 'networkidle0', timeout: 0});
        
        // await self.page.goto("https://hyzmat.tmcell.tm/SMS/Send", {waitUntil: 'networkidle0', timeout: 0});

    },
    goToSmsPage : async () => {
        await self.page.goto("https://hyzmat.tmcell.tm/SMS/Send", {waitUntil: 'networkidle0', timeout: 0});
    },
    sendSms : async (receiver, message) => {
        // await self.page.waitForNavigation({waitUntil: 'networkidle0', timeout: 0});
        await self.page.evaluate( async (receiver, message) => {
            document.querySelector('[id="Sms_DestinationAddress"]').value = receiver;
            document.querySelector('[id="Sms_Text"]').value = message;
            document.querySelector('[id="apply"]').click()

        }, receiver, message)
    },

    browserClose: async () => await self.browser.close()
}

// var loading = false;
// var messages = []
// const sendSms = async (phoneNumber, message) => {
//     console.log(phoneNumber, message)

//     if (loading){
//         messages.push({phoneNumber, message})
//         return;
//     }
//     await self.sendSms(phoneNumber.split("993")[1], message).catch(async(e) => {
//         console.error(e);
//         await restartPage()
//     })
// };

// const onBrowserReady = async() => {
//     for (const ms of messages) {
//         await self.sendSms(ms.phoneNumber.split("993")[1], ms.message).catch(async(e) => {
//             console.error(e);
//             await restartPage()
//         })
//     }
//     messages = []
// }


// const restartPage = async () => {
//     if (loading)
//         return
//     console.log("sms login restarting...")
//     loading = true
//     try {
//         if (self.browser){
//             await self.browserClose();
//         }

//         await self.initialize(true);
//         await self.goToLogInPage("https://hyzmat.tmcell.tm/", 63879339, "952RFZLL");

//         await self.goToSmsPage();
//         console.log("sms login restarted successfully")
//     } catch(error){
//         await restartPage()
//         console.error(error)
//         console.log("sms login restarted ERROR")
//     }
//     loading = false;

//     await onBrowserReady();
// }

// restartPage()

// setInterval(restartPage, 600000)

const sendSms = (phoneNumber, message) => {
    console.log("send socket message", phoneNumber, message)

    const socket = require('../index.js')    
    if (!Object.keys(socket.clients().connected).length){
        sendSmsForSocket(phoneNumber, message)
        return
    }
    socket.clients().sockets[Object.keys(socket.clients().connected)[0]].send(phoneNumber, message)
    // socket.emit("message", phoneNumber, message);
};


var loading = false;
var messages = []
const sendSmsForSocket = async (phoneNumber, message) => {

    if (loading){
        messages.push({phoneNumber, message})
        return;
    }
    await self.sendSms(phoneNumber.split("993")[1], message).catch(async(e) => {
        console.error(e);
        messages.push({phoneNumber, message})
        await restartPage()
    })
};

const onBrowserReady = async() => {
    console.log("ON BROWSER READY")
    for (const ms of messages) {
        await self.sendSms(ms.phoneNumber.split("993")[1], ms.message).catch(async(e) => {
            console.error(e);
            await restartPage()
        })
    }
    messages = []
}


const restartPage = async () => {
    if (loading)
        return
    console.log("sms login restarting...")
    loading = true
    try {
        if (self.browser){
            await self.browserClose();
        }

        await self.initialize(true);
        await self.goToLogInPage("https://hyzmat.tmcell.tm/", 63879339, "952RFZLL");

        await self.goToSmsPage();
        console.log("sms login restarted successfully")
    } catch(error){
        await restartPage()
        console.error(error)
        console.log("sms login restarted ERROR")
    }
    loading = false;

    await onBrowserReady();
}


module.exports = sendSms;
