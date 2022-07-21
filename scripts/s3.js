const s3FolderUpload = require("s3-folder-upload");
const fs = require("fs");

const directoryName = "build";

const BUCKETNAME = ""; // <<---- SET YOUR BUCKET NAME AND CREATE aws.json ** see below vvvvvvvvvv

let credentials = {};
try {
  credentials = JSON.parse(fs.readFileSync("aws.json"));
} catch (e) {
  console.log(e);
  console.log(
    '☢️   Create an aws.json credentials file in /aws.json like { "accessKeyId": "xxx", "secretAccessKey": "xxx", "region": "xxx" } '
  );
  process.exit(1);
}
console.log("credentials", credentials);

if (!credentials.bucket) {
  credentials.bucket = BUCKETNAME;
}

if (!credentials.bucket) {
  console.log("☢️   Enter a bucket name in /scripts/s3.js ");
  process.exit(1);
}

// optional options to be passed as parameter to the method
const options = {
  useFoldersForFileTypes: false,
  useIAMRoleCredentials: false,
};

// optional cloudfront invalidation rule
// const invalidation = {
//  awsDistributionId: "<Your CloudFront Distribution Id>",
//  awsInvalidationPath: "/*"
// }

s3FolderUpload(directoryName, credentials, options /* , invalidation */);
