import * as core from '@aws-cdk/core';
import * as sqs from '@aws-cdk/aws-sqs';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cognito from '@aws-cdk/aws-cognito';
import * as apiGateway from '@aws-cdk/aws-apigateway';

export class QuotationQueueService extends core.Construct {
  constructor(scope: core.Construct, id: string, queue: sqs.Queue, userPool: cognito.UserPool) {
    super(scope, id);

    // Queue refrence
    const queueUrl = queue.queueUrl;

    // Create authorizer
    const authorizer = new apiGateway.CognitoUserPoolsAuthorizer(this, 'NM-Authorizer', {
      cognitoUserPools: [userPool]
  });
  
    // Create a lambda function for operation service handler
    const QuotationQueueServiceHandler = new lambda.Function(this, 'NM-QuotationQueueServiceHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('lambda/quotation_queue_service'),
      handler: 'handler.handler',
      environment: {
        QUEUE_URL: queueUrl
      }
    });

    // Create API for operation service lambda function QuotationServiceHandler
    const QuotationQueueServiceApi = new apiGateway.LambdaRestApi(this, 'NM-QuotationQueueServiceApi', {
      handler: QuotationQueueServiceHandler,
      proxy: false,
      defaultMethodOptions: {
        authorizationType: apiGateway.AuthorizationType.COGNITO,
        authorizer
      }
    });
    
    const operations = QuotationQueueServiceApi.root.addResource('quotations');
    operations.addMethod('POST');  // GET /items

    // Allow operation service lambda function to invoke queue
    queue.grantSendMessages(QuotationQueueServiceHandler);

  }
}