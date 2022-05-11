require("dotenv").config({ path: "server/.env" });
const server = require("./server");

server.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
