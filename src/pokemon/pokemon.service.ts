import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PokemonService {

  private readonly defaultLimit : number 
  constructor(

    @InjectModel(Pokemon.name)
    private readonly pokemonModel : Model<Pokemon>,
    private readonly configService : ConfigService
  ) {
    this.defaultLimit = configService.get<number>('defaultLimit') as number;
  }

  async create(createPokemonDto: CreatePokemonDto) {

    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try {
      
        const pokemon = await this.pokemonModel.create(createPokemonDto);
        return pokemon;

    } catch (error) {
      
      this.handleExceptions(error);
    }

  }

  findAll(paginationDto : PaginationDto) {

    const {limit = this.defaultLimit, offset = 0} = paginationDto;
    // console.log(this.defaultLimit)
    return this.pokemonModel.find()
    .limit(limit)
    .skip(offset);
  }

  async findOne(term: string) {

    let pokemon : Pokemon | null = null;

    if(!isNaN(+term)){
      pokemon = await this.pokemonModel.findOne({no: term});
    }

    if(isValidObjectId(term)){
      pokemon = await this.pokemonModel.findOne({_id: term});
    }

    if(!pokemon){
      pokemon = await this.pokemonModel.findOne({name: term.toLowerCase().trim()});
    }


    if(!pokemon){
      throw new NotFoundException(`Pokemin with term ${term} not found`);
    }
    
    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon  = await this.findOne(term);

    if(updatePokemonDto.name){
      pokemon.name = updatePokemonDto.name.toLowerCase();
    }

    try {
      await pokemon.updateOne(updatePokemonDto, {new: true});
      
    } catch (error) {
      this.handleExceptions(error);
    }


    return {...pokemon.toJSON(), ...updatePokemonDto};
  }

  async remove(id: string) {

    // const pokemon = await this.findOne(id);

    // await pokemon?.deleteOne();

    // const result = await this.pokemonModel.findByIdAndDelete(id);

    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id});

    if(deletedCount === 0){
      throw new BadRequestException(`Pokemon with id ${id} not found`);
    }

    return ;
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`Pokemon exist in DB ${JSON.stringify(error.keyValue)}`);
    }
    console.log(error);
    throw new InternalServerErrorException(`Cant create pokemon - check server logs`);
  }

  clearWithSeed(){
    return this.pokemonModel.deleteMany({});
  }

  insertManyWithSeed(pokemons: CreatePokemonDto[]){
    return this.pokemonModel.insertMany(pokemons);
  }

}
