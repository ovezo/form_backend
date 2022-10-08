const fs = require('fs')
const imagesFolderPath = require('../config/image.config')
const thumbFolderPath = require('../config/thumb.config')

module.exports = {
    phone: (phone) => {
        var regex = /\+9936[0-9]{7}/
        return phone.match(regex)
    },
    email: (email) => {
        var regex = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/; 
        return email.match(regex)
    },
    deleteFile: (filename) => {
        try {
            fs.unlinkSync(imagesFolderPath+filename)
        } catch(err) { }
    },
    deleteThumb: (filename) => {
        try {
            fs.unlinkSync(thumbFolderPath+filename)
        } catch(err) { }
    }
};
