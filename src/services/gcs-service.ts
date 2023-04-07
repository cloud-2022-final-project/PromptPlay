// import { Storage } from '@google-cloud/storage';
// import * as fs from 'fs';
// export class GoogleCloudStorage {
//     private storageClient: Storage;
//     private bucketName: string;

//     constructor(private projectId: string, bucketName: string, keyFileName: string) {
//         this.storageClient = new Storage({ projectId: projectId, keyFilename: keyFileName });
//         this.bucketName = bucketName;
//     }

//     public async checkConnection(): Promise<boolean> {
//         try {
//             await this.storageClient.bucket(this.bucketName).getFiles();
//             console.log(`Connection to bucket ${this.bucketName} is successful.`);
//             return true;
//         } catch (error) {
//             console.error(`Unable to connect to bucket ${this.bucketName}. Error:`, error);
//             return false;
//         }
//     }

//     public async uploadImage(localFilePath: string, remoteFileName: string): Promise<void> {
//         const bucket = this.storageClient.bucket(this.bucketName);
//         const file = bucket.file(remoteFileName);
//         file.createWriteStream({ resumable: false });
//         await file.save(localFilePath);
//         console.log(`File ${localFilePath} uploaded to ${this.bucketName}/${remoteFileName}`);
//     }

// public async downloadImage(remoteFileName: string): Promise<void> {
//     const options = {
//         version: 'v4',
//         action: 'read',
//         expires: Date.now() + 24 * 60 * 60 * 1000, // 1 day
//     };
//     const [url] = await this.storageClient
//         .bucket(this.bucketName)
//         .file(remoteFileName)
//         .getSignedUrl(options)
//         .catch(console.error);
//     console.log(url);
// }
// }
