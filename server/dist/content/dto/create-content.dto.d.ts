export declare class ContentItemDto {
    fileData: string;
    fileName: string;
    contentType: string;
    fileSize: number;
    duration?: number;
}
export declare class CreateContentDto {
    title: string;
    description?: string;
    price: number;
    contentType: string;
    items: ContentItemDto[];
    thumbnailData: string;
}
//# sourceMappingURL=create-content.dto.d.ts.map