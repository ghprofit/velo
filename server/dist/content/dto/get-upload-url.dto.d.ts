export declare class ContentFileDto {
    fileName: string;
    contentType: string;
    fileSize: number;
    type: 'IMAGE' | 'VIDEO';
}
export declare class GetUploadUrlDto {
    title: string;
    description: string;
    category?: string;
    price: number;
    thumbnailFileName: string;
    thumbnailContentType: string;
    thumbnailFileSize: number;
    contentFiles: ContentFileDto[];
}
//# sourceMappingURL=get-upload-url.dto.d.ts.map