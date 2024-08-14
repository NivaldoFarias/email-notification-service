/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    "MyApi": {
      "name": string
      "type": "sst.aws.Function"
      "url": string
    }
    "MyEmail": {
      "sender": string
      "type": "sst.aws.Email"
    }
  }
}
export {}
