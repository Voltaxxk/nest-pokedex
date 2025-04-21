import axios, { AxiosInstance } from "axios";
import { HttpAdapter } from "../interfaces/http-adapter.interface";
import { PokeResponse } from "src/seed/interfaces/poke-response.interface";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AxiosAdapter implements HttpAdapter {
    private readonly axios : AxiosInstance = axios;

    async get<T>(url: string): Promise<T> {

        try {
            const {data} = await this.axios.get<T>('https://pokeapi.co/api/v2/pokemon?limit=10');
            return data
        } catch (error) {
            throw new Error(`This is an error - check server logs`);
        }
    }

}   