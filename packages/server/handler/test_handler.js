
const testService = require('../service/test_service.js');
let d3;  // 保存导入的d3模块

// 异步导入d3-dsv模块并保存到变量d3
import('d3-dsv').then(importedD3 => {
    d3 = importedD3;
}).catch(error => {
    console.error('Failed to import d3-dsv:', error);
});

const fs = require('fs');

async function getCSVData(filePath) {
    if (!d3) {
        console.log("D3 module not yet loaded");
        return null;
    }

    try {
        const fileExists = fs.existsSync(filePath);  // 检查文件是否存在
        if (!fileExists) {
            console.log('File does not exist');
            return null;
        }
        const fileContents = fs.readFileSync(filePath, 'utf8');  // 读取文件内容
        const data = d3.csvParse(fileContents);  // 使用d3解析CSV数据
        return data;
    } catch (err) {
        console.error('Error reading the file:', err);
        return null;
    }
}


// Ensure to wait some time for d3 to be loaded before calling
// setTimeout(() => {
//     data = getCSVData(path);
//     console.log(data);
// }, 1000);  // Adjust delay as necessary





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

    static async getCSVData(req, res) {
        // console.log('getCSVData: ' + req.body.path);
        try {
            var path = "./data/" + req.body.path;
            console.log("get data path:", path);
            var csvData = await getCSVData(path); // 使用await等待异步函数完成
            var data = {
                "code": 0,
                "msg": "success",
                "data": csvData
            };
            // console.log(data.data);
            res.json(data);
        } catch (e) {
            res.end("error ")
        }
    }

}
module.exports = TestHandler;
