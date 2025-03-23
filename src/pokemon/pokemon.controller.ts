import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('pokemons')
export class PokemonController {
  @Get()
  @UseGuards(AuthGuard('jwt')) // Protect this route with JWT
  getPokemons() {
    // This is a mock response. Replace it with your actual logic.
    return [
      { id: 1, name: 'Pikachu' },
      { id: 2, name: 'Bulbasaur' },
      { id: 3, name: 'Charmander' },
    ];
  }
}
