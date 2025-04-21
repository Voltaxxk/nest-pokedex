import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { PokemonService } from 'src/pokemon/pokemon.service';
import { CreatePokemonDto } from 'src/pokemon/dto/create-pokemon.dto';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {



  constructor(
    private readonly pokemonService : PokemonService,
    private readonly http : AxiosAdapter
  ){}


  async executeSeed() {

    await this.pokemonService.clearWithSeed();

    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10');

    const inserPromisesArray : Promise<any>[]  = []

    const pokemonToInsert : CreatePokemonDto[] = []

    for( const {name, url} of data.results){
      const segments = url.split('/');
      const no : number = +segments[segments.length - 2];
      const newPokemon : CreatePokemonDto = {
        name,
        no
      };

      // inserPromisesArray.push(this.pokemonService.create(newPokemon))
      pokemonToInsert.push(newPokemon);
    };


    await this.pokemonService.insertManyWithSeed(pokemonToInsert);

    return data.results;
  }
}
