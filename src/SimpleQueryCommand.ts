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
    private _partitionKey;
    private _sortKey;

    constructor(input: SimpleQueryCommandInput) {
        super(createQueryCommandInput(input));
        this._partitionKey = Object.keys(input.partitionKey)[0];
        this._sortKey = input.sortKey ? Object.keys(input.sortKey)[0] : undefined;
    }

    public sortKey(_sortKey: string) {
        this._sortKey = _sortKey;
        Object.assign(this.input.ExpressionAttributeNames, {[`#${_sortKey}`]: `${_sortKey}`});
        return this;
    }
    
    public between(start: string, end: string, sk?: string) {
        if(sk) {
            this.sortKey(sk);
        }
        if(!this._sortKey){
            throw new Error("sortKey is required");
        }

        const current: QueryCommandInput = this.input;
        current.KeyConditionExpression += ` AND #${this._sortKey} BETWEEN :start AND :end`;

        Object.assign(current.ExpressionAttributeValues, {
            [`:start`]: start,
            [`:end`]: end
        });

        return this;
    }

    public begins_with(begin: string, sk?: string) {
        if(sk) {
            this.sortKey(sk);
        }
        if(!this._sortKey){
            throw new Error("sortKey is required");
        }

        const current: QueryCommandInput = this.input;
        current.KeyConditionExpression += ` AND begins_with( #${this._sortKey}, :begin)`;

        Object.assign(current.ExpressionAttributeValues, {
            [`:begin`]: begin
        });

        return this;
    }

    public eq(value: string, sk?: string) {
        if(sk) {
            this.sortKey(sk);
        }
        if(!this._sortKey){
            throw new Error("sortKey is required");
        }

        const current: QueryCommandInput = this.input;
        current.KeyConditionExpression += ` AND #${this._sortKey} = :value`;
        Object.assign(current.ExpressionAttributeValues, {
            [`:value`]: value
        });
        return this;
    }

    public lt(value: string, sk?: string) {
        if(sk) {
            this.sortKey(sk);
        }
        if(!this._sortKey){
            throw new Error("sortKey is required");
        }

        const current: QueryCommandInput = this.input;
        current.KeyConditionExpression += ` AND #${this._sortKey} < :value`;
        Object.assign(current.ExpressionAttributeValues, {
            [`:value`]: value
        });
        return this;
    }

    public lte(value: string, sk?: string) {
        if(sk) {
            this.sortKey(sk);
        }
        if(!this._sortKey){
            throw new Error("sortKey is required");
        }

        const current: QueryCommandInput = this.input;
        current.KeyConditionExpression += ` AND #${this._sortKey} <= :value`;
        Object.assign(current.ExpressionAttributeValues, {
            [`:value`]: value
        });
        return this;
    }

    public gt(value: string, sk?: string) {
        if(sk) {
            this.sortKey(sk);
        }
        if(!this._sortKey){
            throw new Error("sortKey is required");
        }

        const current: QueryCommandInput = this.input;
        current.KeyConditionExpression += ` AND #${this._sortKey} > :value`;
        Object.assign(current.ExpressionAttributeValues, {
            [`:value`]: value
        });
        return this;
    }

    public gte(value: string, sk?: string) {
        if(sk) {
            this.sortKey(sk);
        }
        if(!this._sortKey){
            throw new Error("sortKey is required");
        }

        const current: QueryCommandInput = this.input;
        current.KeyConditionExpression += ` AND #${this._sortKey} >= :value`;
        Object.assign(current.ExpressionAttributeValues, {
            [`:value`]: value
        });
        return this;
    }

    public createProjectionExpression = (_partitionKeys: Record<string, string>[]) => {
        const current: QueryCommandInput = this.input;
        current.ProjectionExpression = _partitionKeys.map(key => `#${Object.keys(key)[0]}`).join(",");
        return this;
    }
}