import { ContentSourceDto } from './analyze-image.dto';
export declare class DocumentAnalysisOptionsDto {
    extractText?: boolean;
    extractTables?: boolean;
    extractForms?: boolean;
    extractKeyValuePairs?: boolean;
}
export declare class AnalyzeDocumentDto {
    content: ContentSourceDto;
    options?: DocumentAnalysisOptionsDto;
}
export declare class DocumentAnalysisResponseDto {
    success: boolean;
    data?: any;
    error?: string;
    timestamp: Date;
}
//# sourceMappingURL=analyze-document.dto.d.ts.map