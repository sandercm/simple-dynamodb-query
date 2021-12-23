type conditions =
    { begins_with: string } |
    {
        between: {
            start: string;
            end: string;
        }
    } |
    { lt: string } |
    { lte: string } |
    { gt: string } |
    { gte: string }

export interface SimpleQueryCommandInput {
    TableName: string;
    IndexName?: string;
    PartitionKey: Record<string, string>;
    SortKey?: {
        key: string;
        value?: string;
        condition?: conditions;
    };
}