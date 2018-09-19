# WaterExquisite_FileServer
水玲珑小程序文件服务器 hapi.js 程序

# 使用

## 克隆代码
    git clone https://github.com/assmdx/WaterExquisite_FileServer.git
## 安装依赖
    npm i
## 配置服务器信息(config.json)
```
{ 
  "port":8080, //服务器端口
  "people":{
    "id":"appmlex", //服务器id 参考： https://github.com/dwyl/hapi-auth-jwt2
    "name":"sizhai" //服务器用户name
  },
  "jwt": { 
    "useable":true, //是否启动jwt
    "key": "55bfh76ZkgrLZoNa405b1s4Dzv8M5wiK", //参考 https://github.com/dwyl/hapi-auth-jwt2
    "algorithm": "HS256" //jwt使用的算法
  },
  "cors":{
    "origin":["*"] //允许跨域访问的白名单
  },
  "file":{
    "dir":"E:/webApp/WaterExquisite_FileServer/images/", //文件的默认存放位置
    "maxBytes":2000000, //文件最大大小
    "type":"jpg|gif|bmg|jpeg|png" //允许上传的文件类型
  }
}
```



## 运行
    node index
## 调用方式
### 上传文件
- POST
- body:
    - form-data
        - file:filedata
- url : serverIp:8080/add?token=Your token here  
- 返回值
    ```
        {
            result:[''], //上传成功的文件名
            failresult:['']//上传失败的文件名
        }
    ```
### 更新文件
- PUT
- body:
    - form-data
        - file:filedata
- url : serverIp:8080/change?token=Your token here  
- 返回值
    ```
        {
            result:[''], //更新成功的文件名
            failresult:['']//更新失败的文件名
        }
    ```
### 下载文件
- GET
- url : serverIp:8080/get/your file name