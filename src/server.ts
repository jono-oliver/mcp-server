#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const PokemonSchema = z.object({
    id: z.number(),
    name: z.string(),
    height: z.number(),
    weight: z.number(),
    types: z.array(z.object({
        type: z.object({
            name: z.string()
        })
    }))
});

type Pokemon = z.infer<typeof PokemonSchema>;

const server = new McpServer({
    name: "pokemon_pokedex_mcp",
    version: "1.0.0",
    capabilities: {
        tools: {}
    }
});

// Simple function to fetch basic Pokémon information from PokéAPI
async function getPokemonInfo(name: string): Promise<string> {
    try {
        const pokemonName = name.toLowerCase().replace(/\s+/g, '-');
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`Pokémon "${name}" not found.`);
            }
            throw new Error(`Failed to fetch Pokémon data: ${response.status}`);
        }
        
        const pokemon = PokemonSchema.parse(await response.json());
        
        // Simple formatted response
        const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
        const types = pokemon.types.map(type => capitalize(type.type.name)).join(', ');
        
        return `${capitalize(pokemon.name)} (#${pokemon.id}) - ${types} type, ${pokemon.height / 10}m tall, ${pokemon.weight / 10}kg`;
        
    } catch (error) {
        throw error instanceof Error ? error : new Error('Error fetching Pokémon information');
    }
}

server.registerTool("get_pokemon_pokedex_info", {
    title: "Get Pokemon Pokedex Info",
    description: "Get information about a pokemon",
    inputSchema: {
        name: z.string().describe("The name of the Pokemon to look up"),
    },
}, async ({ name }) => {
    try {
        const pokemon = await getPokemonInfo(name);
        return {
            content: [{ type: "text", text: pokemon }],
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return { 
            content: [
                { type: "text", text: `Error getting pokemon info: ${errorMessage}` }
            ], isError: true 
        };
    }
});

async function main() {
    const transport = new StdioServerTransport()
    await server.connect(transport)
}

main();
