import * as core from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as sqs from '@aws-cdk/aws-sqs';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as cognito from '@aws-cdk/aws-cognito';
import * as quotation_list_service from '../lib/quotation-list-service';
import * as quotation_keeping_service from '../lib/quotation-keeping-service';
import * as quotation_queue_service from '../lib/quotation-queue-service';
import * as quotation_delete_service from '../lib/quotation-delete-service';
import * as quotation_attachment_service from '../lib/quotation-attachment-service';
import * as quotation_email_service from '../lib/quotation-email-service';

export class QuotationService extends core.Construct {
  constructor(scope: core.Construct, id: string, userPool: cognito.UserPool) {
    super(scope, id);

    // Creat a new dynamodb table called Quotation
    const quotationTable = new dynamodb.Table(this, 'NM-Quotation', {
        partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
        tableName: 'NM-Quotation',
        removalPolicy: core.RemovalPolicy.DESTROY
      });

    // Create new SQS Queue
    const quotationQueue = new sqs.Queue(this, 'NM-QuotationQueue', {
      // visibilityTimeout: cdk.Duration.seconds(300),
      // retentionPeriod: cdk.Duration.days(7),
      queueName: 'NM-QuotationQueue'
    });

    // create bucket to store for attachments
    const s3Bucket = new s3.Bucket(this, 'NM-quotation-attachments', {
      // bucketName: 'my-bucket',
      removalPolicy: core.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      versioned: false,
      publicReadAccess: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ]
    });

    // Create a new dynamodb table called Attachment
    const attachmentTable = new dynamodb.Table(this, 'NM-Quotation-Attachment', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      tableName: 'NM-Quotation-Attachment',
      removalPolicy: core.RemovalPolicy.DESTROY
    });

    const svcQuotationListService = new quotation_list_service.QuotationListService(this,'QuotationListService', quotationTable)

    const svcQuotationKeepingService = new quotation_keeping_service.QuotationKeepingService(this,'QuotationKeepingService', quotationQueue, quotationTable)

    const svcQuotationQueueService = new quotation_queue_service.QuotationQueueService(this,'QuotationQueueService', quotationQueue, userPool)

    const svcQuotationDeleteService = new quotation_delete_service.QuotationDeleteService(this,'QuotationDeleteService', quotationTable)

    const svcQuotationAttachmentService = new quotation_attachment_service.QuotationAttachmentService(this,'QuotationAttachmentService', s3Bucket, attachmentTable)

    const svcQuotationEmailService = new quotation_email_service.QuotationEmailService(this,'QuotationEmailService', quotationTable)

  }
}