let config = {
    port:8080, //文件服务器开放的端口
    people:{
        id:'',   //id
        name:'' //用户名
    },
    jwt: {
        key: '55bfh76ZkgrLZoNa405b1s4Dzv8M5wiK', //jwt secret key
        algorithm: 'HS256' //jwt使用的算法
    },
    cors:{
        origin:[]   //允许跨域访问的白名单
    },
    file:{
        dir:'',                     //文件的存储路径
        maxBytes:2 * 1000 * 1000,   //允许上传的最大文件大小
        type:'jpg|gif|bmg|jpeg|png' //允许上传的文件类型
    }
};

export {
    config
};