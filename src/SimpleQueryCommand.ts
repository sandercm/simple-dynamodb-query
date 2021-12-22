import {DynamoDBDocumentClient, QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";

interface SimpleQueryCommandInput {
    TableName: string;
    partitionKey: Record<string, string>;
    sortKey?: Record<string, string>;
}

const validateKeys = (input: SimpleQueryCommandInput) => {
    if(input.partitionKey === undefined) {
        throw new Error("partitionKey is required");
    }
};

const createProjectionExpression = (partitionKey: Record<string, string>) =>
    `#${Object.keys(partitionKey)[0]}`;

const createExpressionAttributeNames = (input: SimpleQueryCommandInput) => {
    const partitionKey = Object.keys(input.partitionKey)[0];
    const temp = {[`#${partitionKey}`]: `${partitionKey}`};

    if(input.sortKey) {
        const sortKey = Object.keys(input.sortKey)[0];
        temp[`#${sortKey}`] = `${sortKey}`;
    }
    return temp;
};

const createKeyConditionExpression = (input: SimpleQueryCommandInput) => {
    // TODO: add support for multiple extra conditions
    const partitionKey = Object.keys(input.partitionKey)[0];
    const sortKey = input.sortKey ? Object.keys(input.sortKey)[0] : undefined;

    const pk = `#${partitionKey} = :${partitionKey}`;
    const sk = `#${sortKey} = :${sortKey}`;
    return sortKey ? `${pk} AND ${sk}` : pk;
};

const createExpressionAttributeValues = (input: SimpleQueryCommandInput) => {
    const partitionKey = Object.keys(input.partitionKey)[0];

    const temp = {[`:${partitionKey}`]: input.partitionKey[partitionKey]};

    if(input.sortKey) {
        const sortKey = Object.keys(input.sortKey)[0];
        temp[`:${sortKey}`] = input.sortKey[sortKey];
    }
    return temp;
};

const createQueryCommandInput = function (input: SimpleQueryCommandInput): QueryCommandInput {
    validateKeys(input);

    return {
        TableName: input.TableName,
        KeyConditionExpression: createKeyConditionExpression(input),
        ExpressionAttributeNames: createExpressionAttributeNames(input),
        ExpressionAttributeValues: createExpressionAttributeValues(input)
    };
};

export class SimpleQueryCommand extends QueryCommand{
    constructor(input: SimpleQueryCommandInput) {
        super(createQueryCommandInput(input));
    }
}

const client = new DynamoDBClient({region: 'eu-west-1'});
const docClient = DynamoDBDocumentClient.from(client);

async function main() {
    try {
        const command = new SimpleQueryCommand({
            TableName: 'intocare.Calendar',
            partitionKey: {
                _PK: 'organisation_intocare_calendarCategory_dcc6bc9025ab11ec8b9155b1f3d3f2e0'
            }
        });
        const result = await docClient.send(command);
        console.log(result);
    } catch (e) {
        console.log(e);
    }
}

main();