import * as core from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as eventsources from '@aws-cdk/aws-lambda-event-sources';
import * as apiGateway from '@aws-cdk/aws-apigateway';
import * as iam from '@aws-cdk/aws-iam';

export class QuotationEmailService extends core.Construct {
    constructor(scope: core.Construct, id: string, table: dynamodb.Table) {
        super(scope, id);

        // Create lambda function for quotation_keep_service handler
        const quotationEmailServiceHandler = new lambda.Function(this, 'NM-QuotationEmailServiceHandler', {
            runtime: lambda.Runtime.NODEJS_12_X,
            handler: 'handler.handler',
            code: lambda.Code.fromAsset('lambda/email_service'),
        });

        // Create API for operation service lambda function QuotationServiceHandler
        const quotationEmailServiceApi = new apiGateway.LambdaRestApi(this, 'NM-QuotationEmailServiceApi', {
            handler: quotationEmailServiceHandler,
            proxy: false
        });

        quotationEmailServiceHandler.addToRolePolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["ses:SendTemplatedEmail"],
            resources: ["*"]
        }));

        const operations = quotationEmailServiceApi.root.addResource('email');
        operations.addMethod('GET');  // GET /items

    }
}