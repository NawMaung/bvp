import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import * as quotation_service from '../lib/quotation-service';
// import * as sqs from '@aws-cdk/aws-sqs';

export class NMBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create Cognito User Pool
    const userPool = new cognito.UserPool(this, 'NM-userpool', {
      userPoolName: 'Nm-bvp-userpool',
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: 'Verify your email for our awesome app!',
        emailBody: 'Thanks for signing up to our awesome app! Your verification code is {####}',
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      signInAliases: { username: true, email: true },
      autoVerify: { email: true, phone: true },
      standardAttributes: {
        email: {
          mutable: true,
          required: true,
        },
        fullname: {
          mutable: true,
          required: true,
        },
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      emailSettings: {
        from: "nawmaung@zwenex.com",
        replyTo: "nawmaung@zwenex.com",
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const client = userPool.addClient('Client', {
      oAuth: {
        flows: {
          implicitCodeGrant: true,
        },
        callbackUrls: [
          'https://s-bvp/login',
          'https://s-bvp/users',
        ],
      },
    });
    const domain = userPool.addDomain("NM-bvp-domain", { cognitoDomain: { domainPrefix: "s-bvp" } });
    const signInUrl = domain.signInUrl(client, {
      redirectUri: 'https://s-bvp/login', // must be a URL configured under 'callbackUrls' with the client
    });

     // Setting custom email configuration for UserPool
     const cfnUserPool = userPool.node.defaultChild as cognito.CfnUserPool; // Ref out the CloundFormation User pool object
     cfnUserPool.emailConfiguration = {
         emailSendingAccount: 'DEVELOPER',
         from: 'nawmaung@zwenex.com',
         replyToEmailAddress: 'nawmaung@zwenex.com',
         sourceArn: `arn:aws:ses:us-east-1:196050119321:identity/nawmaung@zwenex.com`,
     };

    const svcQuotationService = new quotation_service.QuotationService(this, 'QuotationService', userPool);

  }
}
