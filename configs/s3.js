const fs = require("fs");
const path = require("path");
const async = require("async");
const AWS = require("aws-sdk");
const readdir = require("recursive-readdir");

const { accessKeyId: KEY, secretAccessKey: SECRET } = require("./aws.json");

// 由address.json中的env环境决定发布哪个bucket
const { env } = require("./address.json");
const BUCKET = `boc-web-${env}`;

const rootFolder = path.resolve(__dirname, "../");
const uploadFolder = path.resolve(rootFolder, "build");
const s3 = new AWS.S3({
  signatureVersion: "v4",
  accessKeyId: KEY,
  secretAccessKey: SECRET,
});

function getFiles(dirPath) {
  return fs.existsSync(dirPath) ? readdir(dirPath) : [];
}

async function deploy(upload) {
  if (!BUCKET || !KEY || !SECRET) {
    throw new Error("you must provide env. variables: [BUCKET, KEY, SECRET]");
  }

  const filesToUpload = await getFiles(path.resolve(__dirname, upload));

  return new Promise((resolve, reject) => {
    async.eachOfLimit(
      filesToUpload,
      10,
      async.asyncify(async (file) => {
        const Key = file
          .replace(`${rootFolder}\\build\\`, "")
          .replace("\\", "/");
        console.log(`uploading: [${Key}]`);
        return new Promise((res, rej) => {
          s3.upload(
            {
              Key,
              Bucket: BUCKET,
              Body: fs.readFileSync(file),
            },
            (err) => {
              if (err) {
                return rej(new Error(err));
              }
              res({ result: true });
            }
          );
        });
      }),
      (err) => {
        if (err) {
          return reject(new Error(err));
        }
        resolve({ result: true });
      }
    );
  });
}

deploy(uploadFolder)
  .then(() => {
    console.log("task complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
