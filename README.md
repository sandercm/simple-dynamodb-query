# Simple DynamoDB query

**Description**:  Writing querry operation in the new V3 node api is still a pain. This gets slightly easier using the documentclient but it's still far from an enjoyable experience. That's why this package was created. It makes writing querries that are fully compatible with the API and mocking library very easy.

Other things to include:

  - **Technology stack**: This project is written in TypeScript and meant as a small import into your current workflow.
  - **Status**:  Early Alpha [CHANGELOG](CHANGELOG.md).
  - There are a few other query builders for DynamoDB atm but none of them let you integrate with API provided from AWS. This is a simple drop in replacement class.


## Dependencies

The only not dev dependency is the "@aws-sdk/lib-dynamodb" package.

## Installation

just run npm install simple-dynamodb-query

## Usage

If you want to query a PK you can do this very easily like this.
```javascript
           const client = new DynamoDBClient({region: 'eu-west-1'});
           const docClient = DynamoDBDocumentClient.from(client);
           
           const command = new SimpleQueryCommand({
               TableName: 'PatientTasks',
               partitionKey: {
                   _PK: 'task_org.entity_shift'
               }
           });
           const result = await docClient.send(command);
```
If you want to filter on one of <, <=, >, >=, BETWEEN, BEGINS_WITH
```javascript
           const client = new DynamoDBClient({region: 'eu-west-1'});
           const docClient = DynamoDBDocumentClient.from(client);
           
           const command = new SimpleQueryCommand({
               TableName: 'PatientTasks',
               partitionKey: {
                   _PK: 'task_org.entity_shift'
               }
           }).sortKey('_SK')
            .between('0', '400');
           const result = await docClient.send(command);
```
If you want to query a GSI just like the regular API you just add IndexName
```javascript
           const client = new DynamoDBClient({region: 'eu-west-1'});
           const docClient = DynamoDBDocumentClient.from(client);
           
           const command = new SimpleQueryCommand({
               TableName: 'PatientTasks',
               IndexName: 'GlobalIndex1'
               partitionKey: {
                   _PK: 'task_org.entity_shift'
               }
           }).sortKey('_SK')
            .between('0', '400');
           const result = await docClient.send(command);
```
Ofcourse this is also compatible with async generators
```javascript
        const paginatorConfig = {
            client: docClient,
            pageSize: 25
        };
        
        const command = new SimpleQueryCommand({
               TableName: 'PatientTasks',
               IndexName: 'GlobalIndex1'
               partitionKey: {
                   _PK: 'task_org.entity_shift'
               }
           });
           
        const page = paginateQuery(paginatorConfig, command.input);

        for await (const item of page) {
            console.log(page);
        }
```


## Getting help

If you have questions, concerns, bug reports, etc, please file an issue in this repository's Issue Tracker.

## Getting involved

Currently still looking at other classes that could use a more dev friendly api.


----

## Open source licensing info
1. [TERMS](TERMS.md)
2. [LICENSE](LICENSE)
3. [CFPB Source Code Policy](https://github.com/cfpb/source-code-policy/)


----

## Credits and references

1. Dynongo https://github.com/SamVerschueren/dynongo
2. AWS API https://github.com/aws/aws-sdk-js-v3
