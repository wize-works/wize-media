import {
    BlobServiceClient,
    StorageSharedKeyCredential,
    generateBlobSASQueryParameters,
    BlobSASPermissions,
    SASProtocol,
} from '@azure/storage-blob';

const account = process.env.AZURE_STORAGE_ACCOUNT!;
const accountKey = process.env.AZURE_STORAGE_KEY!;
const endpoint = process.env.AZURE_STORAGE_ENDPOINT!;

const credentials = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(endpoint, credentials);

function sanitizeFileName(fileName: string): string {
    return fileName
        .replace(/[^a-zA-Z0-9.\-_]/g, '-') // Keep safe characters
        .toLowerCase();
}

export async function generateUploadUrl(type: 'images' | 'videos' | 'files', fileName: string) {
    const timestamp = Date.now();
    const safeFileName = sanitizeFileName(fileName);
    const blobName = `${timestamp}-${safeFileName}`;

    const containerClient = blobServiceClient.getContainerClient(type);
    const blobClient = containerClient.getBlockBlobClient(blobName);

    const expiresOn = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const sas = generateBlobSASQueryParameters({
        containerName: type,
        blobName,
        permissions: BlobSASPermissions.parse("cw"),
        startsOn: new Date(),
        expiresOn,
        protocol: SASProtocol.Https,
    }, credentials).toString();

    const uploadUrl = `${blobClient.url}?${sas}`;
    const fileUrl = blobClient.url;

    return {
        uploadUrl,
        fileUrl,
        finalFileName: blobName, // useful for registering later
    };
}
