/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
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
