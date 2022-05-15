require("dotenv").config({ path: "server/.env" });
const server = require("./server");
const PORT=process.env.PORT||5000;
server.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
