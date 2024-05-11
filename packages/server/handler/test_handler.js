
const testService = require('../service/test_service.js');

class TestHandler {
    /**
     * 获取详细信息
     */
    static async getDetail(req, res) {
        console.log('getDetail');
        try {
            let data = await testService.getDetail();
            res.json(data);
        } catch (e) {
            res.end("error ")
        }
    }

    static async aa(req, res) {
        console.log('aa');
        try {
            console.log("req.body:", req.body);
            var data = {
                "code": 0,
                "msg": "success",
                "data": req.body
            }
            res.json(data);
        } catch (e) {
            res.end("error ")
        }
    }

}
module.exports = TestHandler;
