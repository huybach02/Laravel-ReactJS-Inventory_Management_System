export interface ApiResponseSuccess<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface ApiResponseError {
    success: boolean;
    message: string;
    errors: Record<string, string[] | boolean | number | string>;
}
