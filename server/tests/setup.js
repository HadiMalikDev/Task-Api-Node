module.exports = () => {
  process.env.HOST = "127.0.0.1";
  process.env.USER = "root";
  process.env.PASS = "root";
  process.env.dbName = "node-test";
  process.env.JWT_SECRET = "secretkey101";
  process.env.REDIS_PORT = 6379;
  process.env.REDIS_HOST = "127.0.0.1";
  process.env.REDIS_PASS = "";
};
