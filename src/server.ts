#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
    name: "pokemon_pokedex_mcp",
    version: "1.0.0",
    capabilities: {
        tools: {}
    }
});

// Helper function to capitalize strings
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

// Helper function to handle API errors
async function handleApiError(response: Response, context: string): Promise<never> {
    if (response.status === 404) {
        throw new Error(`${context} not found.`);
    }
    throw new Error(`Failed to fetch ${context}: ${response.status}`);
}

// Tool 1: Search Pokemon by Type
server.registerTool("search_pokemon_by_type", {
    title: "Search Pokemon by Type",
    description: "Find all Pokemon of a specific type",
    inputSchema: {
        type: z.string().describe("The Pokemon type to search for (e.g., 'fire', 'water', 'psychic')"),
        limit: z.number().optional().describe("Maximum number of Pokemon to return (default: 20)")
    },
}, async ({ type, limit = 20 }) => {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/type/${type.toLowerCase()}`);
        if (!response.ok) {
            await handleApiError(response, `Type "${type}"`);
        }
        
        const typeData = await response.json();
        const pokemon = typeData.pokemon.slice(0, limit).map((p: { pokemon: { name: string; url: string } }) => ({
            name: capitalize(p.pokemon.name),
            id: p.pokemon.url.split('/').slice(-2, -1)[0]
        }));
        
        const pokemonList = pokemon.map((p: { name: string; id: string }) => `• ${p.name} (#${p.id})`).join('\n');
        
        return {
            content: [{
                type: "text", 
                text: `Found ${pokemon.length} ${capitalize(type)} type Pokemon:\n\n${pokemonList}`
            }]
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return { 
            content: [{ type: "text", text: `Error searching Pokemon by type: ${errorMessage}` }], 
            isError: true 
        };
    }
});

// Tool 2: Search Pokemon by Generation
server.registerTool("search_pokemon_by_generation", {
    title: "Search Pokemon by Generation",
    description: "Find all Pokemon from a specific generation",
    inputSchema: {
        generation: z.number().describe("The generation number (1-9)"),
        limit: z.number().optional().describe("Maximum number of Pokemon to return (default: 20)")
    },
}, async ({ generation, limit = 20 }) => {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/generation/${generation}`);
        if (!response.ok) {
            await handleApiError(response, `Generation ${generation}`);
        }
        
        const genData = await response.json();
        const pokemon = genData.pokemon_species.slice(0, limit).map((p: { name: string; url: string }) => ({
            name: capitalize(p.name),
            id: p.url.split('/').slice(-2, -1)[0]
        }));
        
        const pokemonList = pokemon.map((p: { name: string; id: string }) => `• ${p.name} (#${p.id})`).join('\n');
        
        return {
            content: [{
                type: "text", 
                text: `Found ${pokemon.length} Pokemon from Generation ${generation}:\n\n${pokemonList}`
            }]
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return { 
            content: [{ type: "text", text: `Error searching Pokemon by generation: ${errorMessage}` }], 
            isError: true 
        };
    }
});

// Tool 3: Get Pokemon Evolution Chain
server.registerTool("get_pokemon_evolution_chain", {
    title: "Get Pokemon Evolution Chain",
    description: "Show the evolution chain for a Pokemon",
    inputSchema: {
        name: z.string().describe("The name of the Pokemon to get evolution chain for")
    },
}, async ({ name }) => {
    try {
        // First get the Pokemon species
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
        if (!pokemonResponse.ok) {
            await handleApiError(pokemonResponse, `Pokemon "${name}"`);
        }
        
        const pokemon = await pokemonResponse.json();
        const speciesResponse = await fetch(pokemon.species.url);
        if (!speciesResponse.ok) {
            await handleApiError(speciesResponse, `Species for "${name}"`);
        }
        
        const species = await speciesResponse.json();
        const evolutionResponse = await fetch(species.evolution_chain.url);
        if (!evolutionResponse.ok) {
            await handleApiError(evolutionResponse, `Evolution chain for "${name}"`);
        }
        
        const evolutionChain = await evolutionResponse.json();
        
        // Parse evolution chain recursively
        function parseEvolutionChain(chain: any, level = 0): string[] {
            const indent = "  ".repeat(level);
            const pokemonName = capitalize(chain.species.name);
            let result = [`${indent}• ${pokemonName}`];
            
            if (chain.evolves_to && chain.evolves_to.length > 0) {
                for (const evolution of chain.evolves_to) {
                    result = result.concat(parseEvolutionChain(evolution, level + 1));
                }
            }
            
            return result;
        }
        
        const evolutionTree = parseEvolutionChain(evolutionChain.chain).join('\n');
        
        return {
            content: [{
                type: "text", 
                text: `Evolution chain for ${capitalize(name)}:\n\n${evolutionTree}`
            }]
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return { 
            content: [{ type: "text", text: `Error getting evolution chain: ${errorMessage}` }], 
            isError: true 
        };
    }
});

// Tool 4: Compare Pokemon
server.registerTool("compare_pokemon", {
    title: "Compare Pokemon",
    description: "Compare stats between multiple Pokemon",
    inputSchema: {
        pokemon: z.array(z.string()).min(2).max(6).describe("Array of Pokemon names to compare (2-6 Pokemon)")
    },
}, async ({ pokemon }) => {
    try {
        const pokemonData = [];
        
        // Fetch data for all Pokemon
        for (const name of pokemon) {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
            if (!response.ok) {
                await handleApiError(response, `Pokemon "${name}"`);
            }
            
            const data = await response.json();
            pokemonData.push({
                name: capitalize(data.name),
                id: data.id,
                types: data.types.map((t: any) => capitalize(t.type.name)).join(', '),
                stats: {
                    hp: data.stats[0].base_stat,
                    attack: data.stats[1].base_stat,
                    defense: data.stats[2].base_stat,
                    specialAttack: data.stats[3].base_stat,
                    specialDefense: data.stats[4].base_stat,
                    speed: data.stats[5].base_stat
                },
                total: data.stats.reduce((sum: number, stat: any) => sum + stat.base_stat, 0)
            });
        }
        
        // Create comparison table
        let comparison = "Pokemon Comparison:\n\n";
        comparison += "Name".padEnd(15) + "Type".padEnd(20) + "HP".padEnd(5) + "ATK".padEnd(5) + "DEF".padEnd(5) + "SPA".padEnd(5) + "SPD".padEnd(5) + "SPE".padEnd(5) + "Total\n";
        comparison += "-".repeat(80) + "\n";
        
        for (const p of pokemonData) {
            comparison += `${p.name}`.padEnd(15) + 
                        `${p.types}`.padEnd(20) + 
                        `${p.stats.hp}`.padEnd(5) + 
                        `${p.stats.attack}`.padEnd(5) + 
                        `${p.stats.defense}`.padEnd(5) + 
                        `${p.stats.specialAttack}`.padEnd(5) + 
                        `${p.stats.specialDefense}`.padEnd(5) + 
                        `${p.stats.speed}`.padEnd(5) + 
                        `${p.total}\n`;
        }
        
        return {
            content: [{
                type: "text", 
                text: comparison
            }]
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        return { 
            content: [{ type: "text", text: `Error comparing Pokemon: ${errorMessage}` }], 
            isError: true 
        };
    }
});

async function main() {
    const transport = new StdioServerTransport()
    await server.connect(transport)
}

main();
