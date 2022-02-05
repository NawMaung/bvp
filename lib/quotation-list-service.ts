import * as core from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apiGateway from '@aws-cdk/aws-apigateway';
import { HttpUserPoolAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers';
import { HttpUrlIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';

export class QuotationListService extends core.Construct {
  constructor(scope: core.Construct, id: string, table: dynamodb.Table) {
    super(scope, id);

    // Create lambda function for quotation_keep_service handler
    const quotationListServiceHandler = new lambda.Function(this, 'NM-QuotationListServiceHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset('lambda/quotation_list_service'),
      environment: {
        QUOTATION_KEEP_SERVICE_TABLE_NAME: table.tableName
      }
    });

    // Create API for operation service lambda function QuotationServiceHandler
    const quotationListServiceApi = new apiGateway.LambdaRestApi(this, 'NM-QuotationListServiceApi', {
      handler: quotationListServiceHandler,
      proxy: false
    });
    const operations = quotationListServiceApi.root.addResource('quotations');
    operations.addMethod('GET');  // GET /items

    table.grantReadData(quotationListServiceHandler);
  }
}