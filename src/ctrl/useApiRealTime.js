var DDPClient = require("ddp-client");
var configs = require("../config.json");
var ddpclient;

class useApiRealTime {

    /**
     * Khởi tạo kết nối với Server Rocket.Chat
     */
    constructor() {
        ddpclient = new DDPClient(configs.server);
        ddpclient.connect((error, wasReconnect) => {
            if (error) {
                console.log('DDP connection error!');
                return;
            }
            if (wasReconnect) {
                console.log('Reestablishment of a connection.');
            }
            console.log('connected!');
        });
    }

    /**
     * Đăng ký kết nối với Server
     * @param {*} _authToken : Token khi Login
     */
    login(_authToken, callback) {
        ddpclient.call('login', [{ "resume": _authToken }], (err, result) => callback(err, result));
    }


    /**
     * Sự kiện lắng nghe
     */
    subscribe(_name, _arrayParameter) {
        ddpclient.subscribe(_name, _arrayParameter);
    }
    /**
     * Lắng nghe Channel General    
     */
    subscribeGenaralRoom() {
        return ddpclient.subscribe("stream-room-messages", ['GENERAL', true]);

    }
    /**
     * Đăng ký lắng nghe ROOM
     */
    subscribelRoom(_roomID) {
        return ddpclient.subscribe("stream-room-messages", [_roomID, true]);
    }

    /**
     * Nhận thông báo sự kiện các Room thay đổi
     * 1. Khi nhận được tin nhắn mới
     * 2. Khi được mời vào 1 Channel/Private Group/Messages
     * 
     * Chú Ý: Không nhận được thông báo khi bị đuổi khỏi phòng!!!
     * @param {*} _userID 
     */
    subscribeNotifyUser(_userID) {
        console.log("lắng nghe 01");
        return ddpclient.subscribe("stream-notify-user", [`${_userID}/rooms-changed`, false], (id) => {console.log("lắng nghe", id)});
    }

    unSubscriptions(_id) {
        ddpclient.subscribe("stream-room-messages", { "msg": "unsub", "id": _id });
    }

    listen(callback) {
        ddpclient.on("message", (msg) => callback(msg))
    }

    /**
     * 
     * @param {*} _filename Tên File
     * @param {*} _filesize Kích thước File
     * @param {*} _filetype Loại File
     * @param {*} _roomID ID PHÒNG NHẬN FILE
     * @param {*} _idFile ID FILE (RANDOM)
     * @param {*} _url URL FILE
     */
    sendingFile(_filename, _filesize, _filetype, _roomID, _idFile, _url) {
        // stept - thực hiện đăng ký
        console.log(_filename + " - " + _filesize + " - " + _filetype + " - " + _roomID + " - " + _idFile + " - " + _url);
        ddpclient.call('slingshot/uploadRequest',
            [
                'rocketchat-uploads',
                {
                    "name": _filename,
                    "size": _filesize,
                    "type": _filetype
                },
                { "rid": _roomID }
            ],
            (err, result) => {
                if (err) {
                    console.log("upload FIle erro", err);
                } else {
                    ddpclient.call('slingshot/uploadRequest',
                        [
                            'rocketchat-uploads',
                            {
                                "name": _filename,
                                "size": _filesize,
                                "type": _filetype
                            },
                            { "rid": _roomID }
                        ], function (err, result) {
                            console.log(err);
                        });
                }
            });
    }


}

module.exports = useApiRealTime;