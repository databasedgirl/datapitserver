import { createConnection, Connection} from 'mysql2';
import dotenv from 'dotenv';
import { notify } from './functions';

dotenv.config();
export async function connect(){
    try{
        var conn:Connection = createConnection({
            host:process.env.DB_HOST,
            port:20914,
            database:process.env.DB,
            user:process.env.DB_USER,
            password:process.env.DB_PASS,
            ssl:{
                ca:process.env.SSL
            }
        });
        return conn; 
    }catch(err){
        notify(`DBERR: ${err.stack}\nERRNO: ${err.errno}`,1);
        return false;
    }
       
}
