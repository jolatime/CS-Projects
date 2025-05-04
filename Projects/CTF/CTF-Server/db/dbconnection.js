// DATABASE
import mysql from 'mysql';

var con = mysql.createConnection({
    host:"nmucapflag.ddns.net",
    user: "Alex",
    password: "password",
    database: "NMUCAPFLAG"
})

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

export default con;