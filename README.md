# WaterExquisite_FileServer
水玲珑小程序文件服务器 hapi.js 程序

# 使用

## 克隆代码
    git clone https://github.com/assmdx/WaterExquisite_FileServer.git
## 安装依赖
    npm i
## 配置服务器验证信息
> index.js 
- line 12 people
- line 33 key
- line 35 algorithm
>reference https://github.com/dwyl/hapi-auth-jwt2
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