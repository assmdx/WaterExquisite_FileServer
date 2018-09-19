'use strict';

const hapi = require('hapi');
const joi = require('joi');
const fs = require("fs");
const path = require('path');

const config = require('./config.json');

//存储图片的文件
//const imagesDir = path.join(__dirname, 'images/');
const imagesDir = config.file.dir;

const server = hapi.server({
    host: 'localhost',
    port: config.port
});

//use jwt in hapi.js https://github.com/dwyl/hapi-auth-jwt2
const people = {
    appmlex: {
        id: config.people.id,
        name: config.people.name
    }
};

//validate user
const validate = async function (decoded, request) {
    if (!people[decoded.id]) {
        return {isValid: false};
    }
    else {
        return {isValid: true};
    }
};

const init = async () => {
    if(config.jwt.useable){
        await server.register(require('hapi-auth-jwt2'));
        server.auth.strategy('jwt', 'jwt',
            {
                key: config.jwt.key,          // Never Share your secret key
                validate: validate,            // validate function defined above
                verifyOptions: {algorithms: [config.jwt.algorithm]}, // pick a strong algorithm
                urlKey: 'token'
            });
        server.auth.default('jwt');
    }


    // upload file in hapi.js https://www.thepolyglotdeveloper.com/2017/11/process-file-uploads-nodejs-hapi-framework/
    //上传文件
    server.route({
        method: 'POST',
        path: '/add',
        config: {
            cors:{
                origin:config.cors.origin
            },
            payload: {
                output: "stream",
                parse: true,
                allow: "multipart/form-data",
                maxBytes: config.file.maxBytes
            },
            auth: (config.jwt.useable ? 'jwt' : null)
        },
        handler: async function (request, response) {
            try {
                let result = [];
                let failresult = [];

                //判断是单个文件上传还是多个文件上传
                console.log(request.payload["file"]);
                if (request.payload["file"] instanceof Array) {
                    let namei;
                    for (let i = 0; i < request.payload["file"].length; i++) {
                        let valiateNamei = await server.methods.valiateFiletype(request.payload["file"][i].hapi.headers["content-type"]);

                        if(!valiateNamei){
                            failresult.push(request.payload["file"][i].hapi.filename);
                            continue;
                        }
                        else {
                            namei = await server.methods.makeFilename(request.payload["file"][i].hapi.filename,request.payload["file"][i].hapi.headers["content-type"]);
                            result.push(namei);
                            request.payload["file"][i].pipe(fs.createWriteStream(imagesDir + namei));
                        }
                    }
                }
                else {
                    let valiateNamei = await server.methods.valiateFiletype(request.payload["file"].hapi.headers["content-type"]);

                    if(!valiateNamei){
                        failresult.push(request.payload["file"].hapi.filename);
                    }
                    else {
                        let namei = await server.methods.makeFilename(request.payload["file"].hapi.filename,request.payload["file"].hapi.headers["content-type"]);
                        result.push(namei);
                        request.payload["file"].pipe(fs.createWriteStream(imagesDir + namei));
                    }
                }
                request.logger.info('add files ', result);
                return response.response({result:result,failresult:failresult}).header("Authorization", request.headers.authorization);
            } catch (err) {
                request.logger.error(err);
                return 'add file failed!';
                // response('add file failed!');
            }
        }
    });

    //更新文件
    server.route({
        method: 'PUT',
        path: '/change',
        config: {
            cors:{
                origin:config.cors.origin
            },
            payload: {
                output: "stream",
                parse: true,
                allow: "multipart/form-data",
                maxBytes: config.file.maxBytes
            },
            auth: (config.jwt.useable ? 'jwt' : null)
        },
        handler: function (request, response) {
            try {
                let result = [];
                let failresult = [];
                //判断是单个文件还是多个文件更新
                if (request.payload["file"] instanceof Array) {
                    let namei;
                    for (let i = 0; i < request.payload["file"].length; i++) {
                        namei = request.payload["file"][i].hapi.filename;
                        if(!fs.existsSync(imagesDir + namei)){
                            failresult.push(namei);
                            continue;
                        }
                        result.push(namei);
                        request.payload["file"][i].pipe(fs.createWriteStream(imagesDir + namei));
                    }
                }
                else {
                    let namei = request.payload["file"].hapi.filename;
                    if(!fs.existsSync(imagesDir + namei)){
                        failresult.push(namei);
                    }
                    else{
                        result.push(namei);
                        request.payload["file"].pipe(fs.createWriteStream(imagesDir + namei));
                    }
                }
                request.logger.info('update files ', result);
                return response.response({result:result,failresult:failresult}).header("Authorization", request.headers.authorization);
            } catch (err) {
                request.logger.error(err);
                return 'update file failed!';
            }
        }
    });

    //Serving Static Content  https://hapijs.com/tutorials/serving-files?lang=en_US
    await server.register(require('inert'));
    //根据文件名访问服务器的文件
    server.route({
        method: 'GET',
        path: '/get/{filename}',
        config: {
            auth: false
        },
        handler: function (request, h) {
            try {
                return h.file(imagesDir + '/' + request.params.filename);
            }
            catch(err) {
                request.logger.error('get file failed:',err);
                return 'get file failed';
            }
        }
    });

    await server.register({
        plugin: require('hapi-pino'),
        options: {
            prettyPrint: false,
            logEvents: ['response']
        }
    });


    await server.start();
    console.log(`file server started at : ${server.info.uri}`);
};

//注册函数 https://hapijs.com/tutorials/server-methods?lang=en_US
//文件名hash
const makeFilename = async (filename,fileContentType) => {
    let index = filename.lastIndexOf(".");
    let ext = filename.substr(index);
    filename =  filename + '_' + Math.random().toString(36).substr(2, 9) + ext;

    const schema = joi.string().regex(/[.](jpg|gif|bmg|jpeg|png)$/);
    let isImg = await joi.validate(filename, schema).then((data)=>{
        console.log('valiate success');
        return true;
    }).catch((err)=>{
        console.log('valiate failed');
        return false;
    });
    if(!isImg){
        let typeIndex = fileContentType.lastIndexOf("/");
        let ext = fileContentType.substr(typeIndex + 1);
        filename = filename + '.' + ext;
    }
    return filename;
};
server.method('makeFilename', makeFilename, {});

//校验上传文件的格式
const valiateFiletype =  async (fileContentType) => {
    console.log(fileContentType);
    const schema = joi.string().regex(/(image\/)(jpg|gif|bmg|jpeg|png)$/);
    return await joi.validate(fileContentType, schema).then((data)=>{
        console.log('valiate success');
        return true;
    }).catch((err)=>{
        console.log('valiate failed');
        return false;
    });
};
server.method('valiateFiletype', valiateFiletype, {});

init();