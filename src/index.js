import { app } from "./app.js";
import { connect_DB } from "./database/index.js";

const PORT = process.env.PORT || 6392
connect_DB()
.then((res)=> {
  app.listen(PORT, ()=> console.log("server is here"))
} )
.catch(error => console.log(error))