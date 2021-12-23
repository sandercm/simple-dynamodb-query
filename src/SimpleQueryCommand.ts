import {DynamoDBDocumentClient, paginateQuery, QueryCommand, QueryCommandInput} from "@aws-sdk/lib-dynamodb";
import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {SimpleQueryCommandInput} from "./types";

const validateKeys = (input: SimpleQueryCommandInput) => {
    if(input.PartitionKey === undefined) {
        throw new Error("PartitionKey is required");
    }
};

const createExpressionAttributeNames = (input: SimpleQueryCommandInput) => {
    const PartitionKey = Object.keys(input.PartitionKey)[0];
    const temp = {[`#${PartitionKey}`]: `${PartitionKey}`};

    if(input.SortKey) {
        temp[`#${input.SortKey.key}`] = `${input.SortKey.value}`;
    }
    return temp;
};

const createKeyConditionExpression = (input: SimpleQueryCommandInput) => {
    const PartitionKey = Object.keys(input.PartitionKey)[0];
    const SortKey = input.SortKey ? input.SortKey.key : undefined;

    const pk = `#${PartitionKey} = :${PartitionKey}`;
    const sk = `#${SortKey} = :${SortKey}`;
    return input.SortKey?.value ? `${pk} AND ${sk}` : pk;
};

const createExpressionAttributeValues = (input: SimpleQueryCommandInput) => {
    const PartitionKey = Object.keys(input.PartitionKey)[0];

    const temp = {[`:${PartitionKey}`]: input.PartitionKey[PartitionKey]};

    if(input.SortKey?.key && input.SortKey?.value) {
        Object.assign(temp, {
            [`:${input.SortKey.key}`]: input.SortKey.value
        });
    }
    return temp;
};

const createQueryCommandInput = function (input: SimpleQueryCommandInput): QueryCommandInput {
    validateKeys(input);

    return {
        TableName: input.TableName,
        IndexName: input.IndexName,
        KeyConditionExpression: createKeyConditionExpression(input),
        ExpressionAttributeNames: createExpressionAttributeNames(input),
        ExpressionAttributeValues: createExpressionAttributeValues(input)
    };
};

export class SimpleQueryCommand extends QueryCommand{
    private readonly _PartitionKey;
    private _SortKey: string | undefined;

    constructor(input: SimpleQueryCommandInput) {
        super(createQueryCommandInput(input));
        this._PartitionKey = Object.keys(input.PartitionKey)[0];
        if (input.SortKey) {
            this.SortKey(input.SortKey.key);
        }

        if (input.SortKey?.condition) {
            switch (Object.keys(input.SortKey.condition)[0]) {
                case "gt":
                    // @ts-ignore
                    if (!input.SortKey.condition.gt) {
                        throw new Error("SortKey condition value is required if using a condition");
                    }
                    // @ts-ignore
                    this.gt(input.SortKey.condition.gt);
                    break;
                case "gte":
                    // @ts-ignore
                    if (!input.SortKey.condition.gte) {
                        throw new Error("SortKey condition value is required if using a condition");
                    }
                    // @ts-ignore
                    this.gte(input.SortKey.condition.gte);
                    break;
                case "lt":
                    // @ts-ignore
                    if (!input.SortKey.condition.lt) {
                        throw new Error("SortKey condition value is required if using a condition");
                    }
                    // @ts-ignore
                    this.lt(input.SortKey.condition.lt);
                    break;
                case "lte":
                    // @ts-ignore
                    if (!input.SortKey.condition.lte) {
                        throw new Error("SortKey condition value is required if using a condition");
                    }
                    // @ts-ignore
                    this.lte(input.SortKey.condition.lte);
                    break;
                case "between":
                    // @ts-ignore
                    if (!input.SortKey.condition.between) {
                        throw new Error("SortKey condition value is required if using a condition");
                    }
                    // @ts-ignore
                    this.between(input.SortKey.condition.between.start, input.SortKey.condition.between.end);
                    break;
                case "beginsWith":
                    // @ts-ignore
                    if (!input.SortKey.condition.begins_with) {
                        throw new Error("SortKey condition value is required if using a condition");
                    }
                    // @ts-ignore
                    this.begins_with(input.SortKey.condition.begins_with);
                    break;
            }
        }
    }

    public SortKey(_SortKey: string) {
        this._SortKey = _SortKey;
        Object.assign(this.input.ExpressionAttributeNames, {[`#${_SortKey}`]: `${_SortKey}`});
        return this;
    }
    
    public between(start: string, end: string, sk?: string) {
        if(sk) {
            this.SortKey(sk);
        }
        if(!this._SortKey){
            throw new Error("SortKey is required");
        }

        const current: QueryCommandInput = this.input;
        current.KeyConditionExpression += ` AND #${this._SortKey} BETWEEN :start AND :end`;

        Object.assign(current.ExpressionAttributeValues, {
            [`:start`]: start,
            [`:end`]: end
        });

        return this;
    }

    public begins_with(begin: string, sk?: string) {
        if(sk) {
            this.SortKey(sk);
        }
        if(!this._SortKey){
            throw new Error("SortKey is required");
        }

        const current: QueryCommandInput = this.input;
        current.KeyConditionExpression += ` AND begins_with( #${this._SortKey}, :begin)`;

        Object.assign(current.ExpressionAttributeValues, {
            [`:begin`]: begin
        });

        return this;
    }

    public eq(value: string, sk?: string) {
        if(sk) {
            this.SortKey(sk);
        }
        if(!this._SortKey){
            throw new Error("SortKey is required");
        }

        const current: QueryCommandInput = this.input;
        current.KeyConditionExpression += ` AND #${this._SortKey} = :value`;
        Object.assign(current.ExpressionAttributeValues, {
            [`:value`]: value
        });
        return this;
    }

    public lt(value: string, sk?: string) {
        if(sk) {
            this.SortKey(sk);
        }
        if(!this._SortKey){
            throw new Error("SortKey is required");
        }

        const current: QueryCommandInput = this.input;
        current.KeyConditionExpression += ` AND #${this._SortKey} < :value`;
        Object.assign(current.ExpressionAttributeValues, {
            [`:value`]: value
        });
        return this;
    }

    public lte(value: string, sk?: string) {
        if(sk) {
            this.SortKey(sk);
        }
        if(!this._SortKey){
            throw new Error("SortKey is required");
        }

        const current: QueryCommandInput = this.input;
        current.KeyConditionExpression += ` AND #${this._SortKey} <= :value`;
        Object.assign(current.ExpressionAttributeValues, {
            [`:value`]: value
        });
        return this;
    }

    public gt(value: string, sk?: string) {
        if(sk) {
            this.SortKey(sk);
        }
        if(!this._SortKey){
            throw new Error("SortKey is required");
        }

        const current: QueryCommandInput = this.input;
        current.KeyConditionExpression += ` AND #${this._SortKey} > :value`;
        Object.assign(current.ExpressionAttributeValues, {
            [`:value`]: value
        });
        return this;
    }

    public gte(value: string, sk?: string) {
        if(sk) {
            this.SortKey(sk);
        }
        if(!this._SortKey){
            throw new Error("SortKey is required");
        }

        const current: QueryCommandInput = this.input;
        current.KeyConditionExpression += ` AND #${this._SortKey} >= :value`;
        Object.assign(current.ExpressionAttributeValues, {
            [`:value`]: value
        });
        return this;
    }

    public createProjectionExpression = (projectionExpression: {field: string; prop: string}[]) => {
        const current: QueryCommandInput = this.input;
        projectionExpression.forEach(expression => {
            Object.assign(current.ExpressionAttributeNames, {
                [`#${expression.field}`]: `${expression.field}`
            });
        });

        const expressions = projectionExpression.map(expression => `#${expression.field}.${expression.prop}`);
        current.ProjectionExpression = `#${this._PartitionKey}, ${expressions.join(', ')}`;
        return this;
    }
}

const client = new DynamoDBClient({region: 'eu-west-1'});
const docClient = DynamoDBDocumentClient.from(client);

async function main() {
    try {
        // const command = new SimpleQueryCommand({
        //     TableName: 'PatientTasks',
        //     PartitionKey: {
        //         _PK: 'service_patienttasks_organisation_intocare.aw_entity_shift'
        //     }
        // }).SortKey('_SK')
        //     .between('sort_0', 'sort_400');

        const command2 = new SimpleQueryCommand({
            TableName: 'PatientTasks',
            PartitionKey: {
                _PK: 'service_patienttasks_organisation_intocare.aw_entity_shift'
            },
            SortKey: {
                key: '_SK',
                condition: {
                    between: {
                        start: 'sort_0',
                        end: 'sort_400'
                    }
                }
            }
        });
        console.log(command2);
        const result = await docClient.send(command2);

        if(result.Items) {
            console.log(result.Items[0].name);
        }
    } catch (e) {
        console.log(e);
    }
}

main();