import { CreateQueueCommand, SQSClient } from "@aws-sdk/client-sqs";
import config from 'config'

// read the config of s3, and clone it deeply
const sqsConfig = JSON.parse(JSON.stringify(config.get('sqs.connection')))

// if we're NOT running localstack, i.e. we want to run against AWS PRODUCTION servers
// then we MUST delete the `endpoint` property from the config object
if (!config.get<boolean>('sqs.isLocalstack')) delete sqsConfig.endpoint

// init the client
const sqsClient = new SQSClient(sqsConfig)
export let queueUrl = ''
export async function createAppQueueIfNotExist() {
    try {
        const queue = await sqsClient.send(
            new CreateQueueCommand({
                QueueName: config.get<string>('sqs.queueName')
            })
        )

        if (!queue.QueueUrl) {
            throw new Error("SQS queue URL was not returned")
        }

        queueUrl = queue.QueueUrl ? queue.QueueUrl : ``
    } catch (e: any) {
        if (e.name === 'QueueAlreadyExists') {
            console.log("Queue already exists");
            return;
        }

        console.error("Unexpected error creating queue:", e);
        throw e;
    }
}
export default sqsClient