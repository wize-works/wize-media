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

    const startsOn = new Date(Date.now() - 2 * 60 * 1000);  // allow 2 min skew
    const expiresOn = new Date(Date.now() + 10 * 60 * 1000); // valid for 10 min

    const sas = generateBlobSASQueryParameters({
        containerName: type,
        blobName,
        permissions: BlobSASPermissions.parse("cw"),
        startsOn,
        expiresOn,
        protocol: SASProtocol.Https,
    }, credentials).toString();

    const uploadUrl = `${blobClient.url}?${sas}`;
    const fileUrl = blobClient.url;

    return {
        uploadUrl,
        fileUrl,
        fileName: blobName, // useful for registering later
    };
}
