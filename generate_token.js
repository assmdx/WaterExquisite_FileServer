const JWT = require('jsonwebtoken');
const obj = {
    id: 'appmlex',
    name: 'sizhai'
}; // object/info you want to sign
const token = JWT.sign(obj, '55bfh76ZkgrLZoNa405b1s4Dzv8M5wiK');
const url = "/path?token=" + token;
console.log(token)
