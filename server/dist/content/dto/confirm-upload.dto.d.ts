export declare class ContentItemDto {
    s3Key: string;
    type: string;
    fileSize: number;
}
export declare class ConfirmUploadDto {
    contentId: string;
    title: string;
    description: string;
    category?: string;
    price: number;
    thumbnailS3Key: string;
    items: ContentItemDto[];
}
//# sourceMappingURL=confirm-upload.dto.d.ts.map