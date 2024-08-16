/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    "modakDatabase": {
      "clusterArn": string
      "database": string
      "host": string
      "password": string
      "port": number
      "secretArn": string
      "type": "sst.aws.Postgres"
      "username": string
    }
    "modakEmail": {
      "sender": string
      "type": "sst.aws.Email"
    }
    "modakGateway": {
      "name": string
      "type": "sst.aws.Function"
      "url": string
    }
  }
}
export {}
