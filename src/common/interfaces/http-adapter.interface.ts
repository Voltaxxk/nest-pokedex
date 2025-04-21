

export interface HttpAdapter {
    get<T>(url: string): Promise<T>;
    // post(url: string, data?: any): Promise<any>;
    // put(url: string, data?: any): Promise<any>;
    // delete(url: string, data?: any): Promise<any>;
}