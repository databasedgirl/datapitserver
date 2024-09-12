import {Connection, createConnection} from 'mysql';
import dotenv from 'dotenv';

dotenv.config();
export async function connect(){
    var conn:Connection = createConnection({
        host:process.env.DB_HOST,
        port:3306,
        database:process.env.DB,
        user:process.env.DB_USER,
        password:process.env.DB_PASS,
    });
    return conn;    
}
