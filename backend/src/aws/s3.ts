import { CreateBucketCommand, S3Client } from "@aws-sdk/client-s3";
import config from 'config'
import { PutBucketCorsCommand } from "@aws-sdk/client-s3";

// read the config of s3, and clone it deeply
const s3Config = JSON.parse(JSON.stringify(config.get('s3.connection')))

// if we're NOT running localstack, i.e. we want to run against AWS PRODUCTION servers
// then we MUST delete the `endpoint` property from the config object
if (!config.get<boolean>('s3.isLocalstack')) delete s3Config.endpoint

// init the client
const s3Client = new S3Client(s3Config)

export async function createAppBucketIfNotExist() {
    try {
        async function setCorsRules() {
            const corsParams: { CORSConfiguration: { CORSRules: any[] } } = {
                CORSConfiguration: config.get("s3.corsRules")
            };

            await s3Client.send(new PutBucketCorsCommand({
                Bucket: config.get<string>("s3.bucket"),
                ...corsParams
            }));

            console.log("CORS rules applied successfully!");
        }

        await s3Client.send(
            new CreateBucketCommand({
                Bucket: config.get<string>('s3.bucket'),
            })
        )
        await setCorsRules();
    } catch (e) {
        // ignore
        console.log('Bucket probably already exist')
    }
}

export async function createBucketIfNotExist(name: string) {
    try {
        await s3Client.send(
            new CreateBucketCommand({
                Bucket: name,
            })
        )
    } catch (e) {
        alert(e)
    }
}

export default s3Client